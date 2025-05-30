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

const REGEXP_INFOS = [
	{regex: /^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/releases(?:\/[a-zA-Z0-9_.-]+)*$/, domain: "github.com", requestInit: {headers: {'Accept': 'application/json'}}},
	{regex: /^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/releases\/download(?:\/[a-zA-Z0-9_.-]+)+$/, domain: "github.com"},
	{regex: /^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/raw(?:\/[a-zA-Z0-9_.-]+)+$/, domain: "github.com"},
	{regex: /^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/refs\/heads\/[0-9a-zA-Z]+(?:\/[a-zA-Z0-9_.-]+)+$/, domain: "raw.githubusercontent.com"},
	{regex: /^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/[0-9a-zA-Z]+(?:\/[a-zA-Z0-9_.-]+)+$/, domain: "raw.githubusercontent.com"},
];
const DOMAINS = ["github.com", "github.com", "github.com"];

export default {
	fetch(request: Request<unknown, IncomingRequestCfProperties<unknown>>, env: Env, ctx: ExecutionContext): Response | Promise<Response> {
		const url = new URL(request.url);
		const matchInfo = REGEXP_INFOS.find(r=>url.pathname.match(r.regex));
		if (matchInfo === undefined) return Promise.resolve(nginx());
		console.log(matchInfo)
		const nextRequest = new Request(request.url.replace(url.origin, "https://" + matchInfo.domain), Object.assign({}, request, matchInfo.requestInit));
		// if (matchInfo.requestInit) {
		// 	return fetch(nextRequest)
		// 		.then(response => new Request(response.headers.get('Location'), {
		// 			headers: {'Accept': 'application/json'},
		// 		}))
		// 		.then(req => fetch(req));
		// }
		return fetch(nextRequest, {redirect: 'follow'});
	}

} as ExportedHandler<Env>