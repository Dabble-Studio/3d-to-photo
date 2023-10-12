export default async function handler(req, res) {

    console.log(`Token ${process.env.REPLICATE_API_TOKEN}`)

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Pinned to a specific version of Stable Diffusion
        // See https://replicate.com/stability-ai/stable-diffussion/versions
        // inpainting
        //model: "andreasjansson/stable-diffusion-inpainting",
        version: "e490d072a34a94a11e9711ed5a6ba621c3fab884eda1665d9d3a282d65a21180", // SD 1.5 inpainting
        //version: "f9bb0632bfdceb83196e85521b9b55895f8ff3d1d3b487fd1973210c0eb30bec", // SD v2 inpainting
        // This is the text prompt that will be submitted by a form on the frontend
        input: req.body,
      }),
    });
  
    if (response.status !== 201) {
      let error = await response.json();
      res.statusCode = 500;
      res.end(JSON.stringify({ detail: error.detail }));
      return;
    }
  
    const prediction = await response.json();
    res.statusCode = 201;
    res.end(JSON.stringify(prediction));
  }
