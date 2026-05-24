import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This route is called by Vercel Cron (configured in vercel.json) every minute.
// It finds all pending reservations past their expiresAt and releases them,
// returning the reserved units to available stock.
export async function GET(req: NextRequest) {
  // Protect the cron endpoint from arbitrary callers
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find expired pending reservations
    const expired = await prisma.reservation.findMany({
      where: {
        status: "pending",
        expiresAt: { lt: now },
      },
    });

    if (expired.length === 0) {
      return NextResponse.json({ released: 0 });
    }

    // Release each one atomically
    let released = 0;
    for (const reservation of expired) {
      await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`
          UPDATE "StockLevel"
          SET "reservedUnits" = "reservedUnits" - ${reservation.quantity}
          WHERE "productId"   = ${reservation.productId}
            AND "warehouseId" = ${reservation.warehouseId}
        `;
        await tx.reservation.update({
          where: { id: reservation.id },
          data: { status: "released" },
        });
      });
      released++;
    }

    console.log(`[cron] Released ${released} expired reservations`);
    return NextResponse.json({ released });
  } catch (error) {
    console.error("[cron/expire-reservations]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
