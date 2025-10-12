import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const apiKey = process.env.PLANT_API_KEY;
  const apiUrl = `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}`;

  const plantFormData = new FormData();
  plantFormData.append("images", file);

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      body: plantFormData,
    });

    const data = await res.json();

    // Handle non-plant case
    if (!res.ok || data.statusCode === 404) {
      return NextResponse.json({ error: "The uploaded image does not appear to be a plant." }, { status: 200 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong while processing the image." }, { status: 500 });
  }
}
