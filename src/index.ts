function nginx() {
	return new Response(`
	<!DOCTYPE html>
	<html>
	<head>
	<title>Welcome to nginx!</title>
	<style>
		body {
			width: 35em;
			margin: 0 auto;
			font-family: Tahoma, Verdana, Arial, sans-serif;
		}
	</style>
	</head>
	<body>
	<h1>Welcome to nginx!</h1>
	<p>If you see this page, the nginx web server is successfully installed and
	working. Further configuration is required.</p>
	
	<p>For online documentation and support please refer to
	<a href="http://nginx.org/">nginx.org</a>.<br/>
	Commercial support is available at
	<a href="http://nginx.com/">nginx.com</a>.</p>
	
	<p><em>Thank you for using nginx.</em></p>
	</body>
	</html>
	`,
		{
			headers: {
				'Content-Type': 'text/html; charset=UTF-8',
			}
		}
	);
}

const REGEX_RELEASES = /^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/releases(?:\/[a-zA-Z0-9_.-]+)+$/;
const REGEX_ASSETS = /^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/releases\/download(?:\/[a-zA-Z0-9_.-]+)+$/;
const REGEX_RAW = /^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/raw(?:\/[a-zA-Z0-9_.-]+)+$/;

export default {
	fetch(request: Request<unknown, IncomingRequestCfProperties<unknown>>, env: Env, ctx: ExecutionContext): Response | Promise<Response> {
		const url = new URL(request.url);
		const matchType = [REGEX_RELEASES, REGEX_ASSETS, REGEX_RAW].findIndex(r=>url.pathname.match(r));
		if (matchType < 0) return Promise.resolve(nginx());
		const nextRequest = new Request(request.url.replace(url.origin, "https://github.com"), request);
		if (matchType === 0) {
			return fetch(nextRequest)
				.then(response => new Request(response.headers.get('Location'), {
					headers: {'Accept': 'application/json'},
				}))
				.then(req => fetch(req));
		}
		return fetch(nextRequest, {redirect: 'follow'});
	}

} as ExportedHandler<Env>