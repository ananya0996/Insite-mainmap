import { loadOccupancyChoroplethPayload } from "@/lib/occupancy-choropleth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await loadOccupancyChoroplethPayload();
    const { years, geojson } = payload;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            `{"years":${JSON.stringify(years)},"geojson":{"type":"FeatureCollection","features":[`,
          ),
        );

        for (let i = 0; i < geojson.features.length; i++) {
          if (i > 0) controller.enqueue(encoder.encode(","));
          controller.enqueue(
            encoder.encode(JSON.stringify(geojson.features[i])),
          );
        }

        controller.enqueue(encoder.encode("]}}"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to build occupancy choropleth payload:", error);
    return new Response(
      JSON.stringify({ error: "Failed to load occupancy choropleth data." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
