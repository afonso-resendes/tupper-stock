import { NextRequest, NextResponse } from "next/server";
import { storefrontClient } from "@/lib/shopify";

const COLLECTIONS_QUERY = `
  query getCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const response = await storefrontClient.request(COLLECTIONS_QUERY, {
      variables: { first: 50 },
    });

    if (!response.data?.collections) {
      return NextResponse.json(
        { error: "No collections data received from Shopify" },
        { status: 500 }
      );
    }

    const collections = response.data.collections.edges.map(
      ({ node }: any) => ({
        id: node.id,
        title: node.title,
        handle: node.handle,
        description: node.description,
        image: node.image?.url || null,
      })
    );

    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch collections",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
