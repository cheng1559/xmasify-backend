export interface Env {
	AI: Ai;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (request.method !== 'POST') {
			return new Response('Method Not Allowed', { status: 405 });
		}

		const formData = await request.formData();

		const avatarFile = formData.get('avatar') as File;
		const maskFile = formData.get('mask') as File;
		const prompt = formData.get('prompt') as string;

		if (!avatarFile || !maskFile || !prompt) {
			return new Response('Missing avatar, mask, or prompt', { status: 400 });
		}

		const avatarBuffer = await avatarFile.arrayBuffer();
		const maskBuffer = await maskFile.arrayBuffer();

		const inputs = {
			prompt: prompt,  // 可以根据需要调整提示词
			image: [...new Uint8Array(avatarBuffer)],  // 转换为 Uint8Array 数组
			mask: [...new Uint8Array(maskBuffer)],    // 转换为 Uint8Array 数组
			width: 512,
			height: 512
		};

		const response = await env.AI.run(
			"@cf/runwayml/stable-diffusion-v1-5-inpainting",
			inputs
		);

		return new Response(response, {
			headers: {
				"content-type": "image/png",
			},
		});
	},
} satisfies ExportedHandler<Env>;
