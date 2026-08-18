globalThis.__nitro_main__ = import.meta.url;
import { a as toEventHandler, c as serve, i as defineLazyEventHandler, n as HTTPError, r as defineHandler, s as NodeResponse, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { i as withoutTrailingSlash, n as joinURL, r as withLeadingSlash, t as decodePath } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/favicon.svg": {
		"type": "image/svg+xml",
		"etag": "\"174-vOJD+DIUxxHjZUrc1VuwJbH9XVA\"",
		"mtime": "2026-08-18T03:51:53.703Z",
		"size": 372,
		"path": "../public/favicon.svg"
	},
	"/og.jpg": {
		"type": "image/jpeg",
		"etag": "\"288d4-GSJ1O6F8e0YQIUr4pvwJl4mZCDs\"",
		"mtime": "2026-08-18T03:51:53.703Z",
		"size": 166100,
		"path": "../public/og.jpg"
	},
	"/tex-grass.jpg": {
		"type": "image/jpeg",
		"etag": "\"b913-4t3Uo43/RPamufP1wmJ7Ppl49I4\"",
		"mtime": "2026-08-18T03:51:53.703Z",
		"size": 47379,
		"path": "../public/tex-grass.jpg"
	},
	"/tex-oak.jpg": {
		"type": "image/jpeg",
		"etag": "\"6d5b-otzElOp4JgpsG2sx88zzRhgLeRU\"",
		"mtime": "2026-08-18T03:51:53.707Z",
		"size": 27995,
		"path": "../public/tex-oak.jpg"
	},
	"/tex-stone.jpg": {
		"type": "image/jpeg",
		"etag": "\"cd66-KMVcIc9V7LfaAeoArqgyCg+QYkY\"",
		"mtime": "2026-08-18T03:51:53.707Z",
		"size": 52582,
		"path": "../public/tex-stone.jpg"
	},
	"/hero-ridge.jpg": {
		"type": "image/jpeg",
		"etag": "\"7e0d1-Y0+sKoH3/lY9hoQVQCFK7cspNLc\"",
		"mtime": "2026-08-18T03:51:53.715Z",
		"size": 516305,
		"path": "../public/hero-ridge.jpg"
	},
	"/__grok/icon-180.png": {
		"type": "image/png",
		"etag": "\"1078d-0g4VScfTZdAWOs061djvAFwt0Dw\"",
		"mtime": "2026-08-18T05:35:00.000Z",
		"size": 67469,
		"path": "../public/__grok/icon-180.png"
	},
	"/__grok/nlo-180.png": {
		"type": "image/png",
		"etag": "\"1078d-0g4VScfTZdAWOs061djvAFwt0Dw\"",
		"mtime": "2026-08-18T05:35:00.000Z",
		"size": 67469,
		"path": "../public/__grok/nlo-180.png"
	},
	"/__grok/nlo-192.png": {
		"type": "image/png",
		"etag": "\"1283f-g3mF3Up8d44JUEtGC0SOFk3WJeI\"",
		"mtime": "2026-08-18T05:35:00.000Z",
		"size": 75839,
		"path": "../public/__grok/nlo-192.png"
	},
	"/__grok/nlo-512.png": {
		"type": "image/png",
		"etag": "\"6ea32-fbuTzSF9RJJaRmxrYlNRSWIbyxs\"",
		"mtime": "2026-08-18T05:35:00.000Z",
		"size": 452978,
		"path": "../public/__grok/nlo-512.png"
	},
	"/assets/_site-B6F2Hta0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11f9-X9gx/4tBKUT8k+E8+ZXWUMGEiwQ\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 4601,
		"path": "../public/assets/_site-B6F2Hta0.js"
	},
	"/assets/_site-DCaK5lSC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4c-C4vrZ+m3AVs91v0yNuz2nyHP6CY\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 76,
		"path": "../public/assets/_site-DCaK5lSC.js"
	},
	"/assets/_site-DxlDUook.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1cd9-woLKOYMyrz3lWIWpTfHC/LDtuPs\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 7385,
		"path": "../public/assets/_site-DxlDUook.js"
	},
	"/assets/account-CIEf9HBV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13da-T05/iiFY3Yl213AcxQfJZ5JDr7U\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 5082,
		"path": "../public/assets/account-CIEf9HBV.js"
	},
	"/assets/badge-FSl4sVgP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"259-nhN0+WkJcgV/8K3t8FXIdRIQyus\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 601,
		"path": "../public/assets/badge-FSl4sVgP.js"
	},
	"/assets/boards-DkGS-S1V.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"afa-MvZK0OsA8j0kqLdeO1ga7DfHFzc\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 2810,
		"path": "../public/assets/boards-DkGS-S1V.js"
	},
	"/assets/bounties-CIZjRViG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cb8-k4U1+Ih8XiYZsHk8R7UvepyhbX8\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 3256,
		"path": "../public/assets/bounties-CIZjRViG.js"
	},
	"/assets/button-DaaWUNxq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f7f-EVPLSxL4SaT9mFr962oii/UB/ds\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 3967,
		"path": "../public/assets/button-DaaWUNxq.js"
	},
	"/assets/client-D3aiNpL4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7cd7-aRwtoygZyJEAha7ZaxZquiMA/uk\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 31959,
		"path": "../public/assets/client-D3aiNpL4.js"
	},
	"/assets/content-DzRV4rmZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"165d-lTf6oq8KmcTvlDsZCIY6/97iATc\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 5725,
		"path": "../public/assets/content-DzRV4rmZ.js"
	},
	"/assets/copy-ip-DObIJ0bo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"90b-7HwyD0qkMRw5gvy36gSWFELD9BY\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 2315,
		"path": "../public/assets/copy-ip-DObIJ0bo.js"
	},
	"/assets/dist-CeVTBvo2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8332-1r/gYI5uJF741cdC6Ob/GYkjZmk\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 33586,
		"path": "../public/assets/dist-CeVTBvo2.js"
	},
	"/hero-plains.jpg": {
		"type": "image/jpeg",
		"etag": "\"c3749-x1cKKCCPpZMLmLhApmZ1XIIG6t4\"",
		"mtime": "2026-08-18T03:51:53.703Z",
		"size": 800585,
		"path": "../public/hero-plains.jpg"
	},
	"/world-raid.jpg": {
		"type": "image/jpeg",
		"etag": "\"a72a3-+cadGpTw+IVijpoyMdrcAWIyD4s\"",
		"mtime": "2026-08-18T03:51:53.719Z",
		"size": 684707,
		"path": "../public/world-raid.jpg"
	},
	"/world-hills.jpg": {
		"type": "image/jpeg",
		"etag": "\"ba84b-FJ0wBbYLPDnie17jqIG+pcjBasg\"",
		"mtime": "2026-08-18T03:51:53.719Z",
		"size": 763979,
		"path": "../public/world-hills.jpg"
	},
	"/spawn-plaza.jpg": {
		"type": "image/jpeg",
		"etag": "\"b4fca-1FpE/w44Dpf5DLnpap0NjZlkkSo\"",
		"mtime": "2026-08-18T03:51:53.703Z",
		"size": 741322,
		"path": "../public/spawn-plaza.jpg"
	},
	"/assets/dist-Dc_qrU0M.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"281-pVC0i37HqkbYlg9B5HKBosEgBv4\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 641,
		"path": "../public/assets/dist-Dc_qrU0M.js"
	},
	"/assets/gates-_ljge7yC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"474-JBcmpw8V+zJglSmDf+bfETvUVCw\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 1140,
		"path": "../public/assets/gates-_ljge7yC.js"
	},
	"/world-plots.jpg": {
		"type": "image/jpeg",
		"etag": "\"cf248-QXYLZ013dTGipzX+yR4p8x2T36A\"",
		"mtime": "2026-08-18T03:51:53.723Z",
		"size": 848456,
		"path": "../public/world-plots.jpg"
	},
	"/assets/index-BuJVsxtn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4e095-C9sOufjRqx9xXdcG2+6d7K9w3k0\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 319637,
		"path": "../public/assets/index-BuJVsxtn.js"
	},
	"/assets/input-B70Tk3-U.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c3-qAcIm59y9dlEmYT41ocnWjUviz8\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 451,
		"path": "../public/assets/input-B70Tk3-U.js"
	},
	"/assets/intel-CBxlomR7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"385-HZ080sW+rDDmgNI2KWeb1QOr4eg\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 901,
		"path": "../public/assets/intel-CBxlomR7.js"
	},
	"/world-workshop.jpg": {
		"type": "image/jpeg",
		"etag": "\"92607-R+8JEF3utxiTIOYoCxXevq934Q8\"",
		"mtime": "2026-08-18T03:51:53.727Z",
		"size": 599559,
		"path": "../public/world-workshop.jpg"
	},
	"/assets/jsx-runtime-NZYk81nU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b3-E2cxOBZp5vJBrKGtXXATYgbVvjE\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 435,
		"path": "../public/assets/jsx-runtime-NZYk81nU.js"
	},
	"/assets/lazyRouteComponent-CXfVbKH_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f87-fJKnz1uS9a8LvHvXtYc/RIlhvJ4\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 3975,
		"path": "../public/assets/lazyRouteComponent-CXfVbKH_.js"
	},
	"/assets/link-CNtqiRdp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"53db-tcdeub6/m+zBT9buulzarUWSeM0\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 21467,
		"path": "../public/assets/link-CNtqiRdp.js"
	},
	"/assets/login-D0jO2mhE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f5-AOQk2iwUC4n78fcdVxvfqLwnfK0\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 4341,
		"path": "../public/assets/login-D0jO2mhE.js"
	},
	"/assets/not-found-DIgawKw1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"37-RTB6YH5iXRKeXz1Sn6ZQ+vS0lnc\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 55,
		"path": "../public/assets/not-found-DIgawKw1.js"
	},
	"/assets/page-frame-DmHYnEDU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"311-pHQjnrgkquIN8DBOptkM5kXvtO4\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 785,
		"path": "../public/assets/page-frame-DmHYnEDU.js"
	},
	"/assets/password-Ba-jbZij.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"148-VCLzBzaW0RMwXK1vxeWzZpIJQaI\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 328,
		"path": "../public/assets/password-Ba-jbZij.js"
	},
	"/assets/play-CyoqI0J2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f5c-hevHTKIAYlAocGLcKzgKyCuudJk\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 3932,
		"path": "../public/assets/play-CyoqI0J2.js"
	},
	"/assets/player-face-C2eecXoG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"176-9we31/3IZFKtXuroxQLvwge//4o\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 374,
		"path": "../public/assets/player-face-C2eecXoG.js"
	},
	"/assets/react-CwJFpaho.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d6c-KfTag/o29kzdrpfhBdCUUysb2R0\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 7532,
		"path": "../public/assets/react-CwJFpaho.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/roster-DZc9-VdI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"763-ZTAot2nRhmVxQfOWaDc5loAVmfI\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 1891,
		"path": "../public/assets/roster-DZc9-VdI.js"
	},
	"/assets/roster._ign-BhYaCx6q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c69-RvslVHGa2iAM7/EM3wpXQrJsVLo\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 3177,
		"path": "../public/assets/roster._ign-BhYaCx6q.js"
	},
	"/assets/rules-DS47bokC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2f0-F0ZrjCSrDsUhc2iaFMGTocZ31ME\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 752,
		"path": "../public/assets/rules-DS47bokC.js"
	},
	"/assets/season-D6sL7EKK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a44-z7tnHJZQUOpMgysJWf8Bg2oW73E\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 2628,
		"path": "../public/assets/season-D6sL7EKK.js"
	},
	"/assets/server-DVC5-I8Z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a521-URQmLU3ZbszgsOCVUS66UM8N1e0\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 42273,
		"path": "../public/assets/server-DVC5-I8Z.js"
	},
	"/assets/shop-Dvhvus3_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15b5-dLRicGpu9XoVF3Z9i98rkVxKx90\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 5557,
		"path": "../public/assets/shop-Dvhvus3_.js"
	},
	"/assets/status-live-CPOLocqm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16b-0KA8yyiqip1RWrinyclHoz7Xyw0\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 363,
		"path": "../public/assets/status-live-CPOLocqm.js"
	},
	"/assets/use-current-user-BgR8-9Op.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"127-XN/6t4zfRgYvDj5wa+X3ogllgzA\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 295,
		"path": "../public/assets/use-current-user-BgR8-9Op.js"
	},
	"/assets/useMatch-D3931Unm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"253-PWCx+0Wj9Y1FHlEdvXcvl1ykQkM\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 595,
		"path": "../public/assets/useMatch-D3931Unm.js"
	},
	"/assets/useNavigate-BUq4u-MF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"177-aIEcQsPRomlWbTgKjKhipoR6w2A\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 375,
		"path": "../public/assets/useNavigate-BUq4u-MF.js"
	},
	"/assets/utils-BHB4BAMe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6c2c-5oi4JklnHkKQ30g2UJrFYmzVA80\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 27692,
		"path": "../public/assets/utils-BHB4BAMe.js"
	},
	"/assets/world-DWx0H_JV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"33f-Pur/vaCJ2VqR0N/h2Q7mFL+kcX4\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 831,
		"path": "../public/assets/world-DWx0H_JV.js"
	},
	"/__grok/install/styles.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1a3d-VUsWOMAheo1/P30EqU5qaIkyvIQ\"",
		"mtime": "2026-08-18T03:51:53.703Z",
		"size": 6717,
		"path": "../public/__grok/install/styles.css"
	},
	"/assets/styles-B46k0CM4.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"9100-YS17oDT1npJh66gt7sZSvloKBME\"",
		"mtime": "2026-08-18T03:51:52.547Z",
		"size": 37120,
		"path": "../public/assets/styles-B46k0CM4.css"
	},
	"/__grok/install/assets/homescreen/glass-puzzle.svg": {
		"type": "image/svg+xml",
		"etag": "\"713-AP2wG8KChAGjse1Fn+f/+vDN+sQ\"",
		"mtime": "2026-08-18T03:51:53.727Z",
		"size": 1811,
		"path": "../public/__grok/install/assets/homescreen/glass-puzzle.svg"
	},
	"/__grok/install/assets/homescreen/glass-share.svg": {
		"type": "image/svg+xml",
		"etag": "\"954-jb3ATcKjqgMOYrA/4w1v21j0Jvg\"",
		"mtime": "2026-08-18T03:51:53.727Z",
		"size": 2388,
		"path": "../public/__grok/install/assets/homescreen/glass-share.svg"
	},
	"/__grok/install/assets/homescreen/logo-grok.svg": {
		"type": "image/svg+xml",
		"etag": "\"423-5mXO+yh9KW40jM3to5JlWPhxNK8\"",
		"mtime": "2026-08-18T03:51:53.727Z",
		"size": 1059,
		"path": "../public/__grok/install/assets/homescreen/logo-grok.svg"
	},
	"/__grok/install/assets/homescreen/ob-ipad.png": {
		"type": "image/png",
		"etag": "\"18dd3-wlRwrpmBImStuiu+4poVz7ANin4\"",
		"mtime": "2026-08-18T03:51:53.727Z",
		"size": 101843,
		"path": "../public/__grok/install/assets/homescreen/ob-ipad.png"
	},
	"/__grok/install/assets/homescreen/plus.svg": {
		"type": "image/svg+xml",
		"etag": "\"961-sSBPunx/13vbMNAlPxb7UeO3l3A\"",
		"mtime": "2026-08-18T03:51:53.727Z",
		"size": 2401,
		"path": "../public/__grok/install/assets/homescreen/plus.svg"
	},
	"/__grok/install/assets/homescreen/ob-phone.png": {
		"type": "image/png",
		"etag": "\"194bc-oZradWHIHO68q2glHU0Gk5ttpWA\"",
		"mtime": "2026-08-18T03:51:53.727Z",
		"size": 103612,
		"path": "../public/__grok/install/assets/homescreen/ob-phone.png"
	}
};
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/static.mjs
var METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
var EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region scripts/install-page.html?raw
var install_page_default = "<!DOCTYPE html>\n<html lang=\"en\" class=\"device-desktop\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta\n      name=\"viewport\"\n      content=\"width=device-width, initial-scale=1, viewport-fit=cover\"\n    />\n    <meta name=\"color-scheme\" content=\"dark\" />\n    <meta name=\"theme-color\" content=\"#000000\" />\n    <meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black\" />\n    <meta name=\"apple-mobile-web-app-title\" content=\"{{APP_NAME}}\" />\n    <title>Add {{APP_NAME}} to your Home Screen</title>\n    <link rel=\"manifest\" href=\"/__grok/manifest.webmanifest\" />\n    <link rel=\"apple-touch-icon\" href=\"/__grok/nlo-180.png\" />\n    <link rel=\"stylesheet\" href=\"/__grok/install/styles.css\" />\n    <script>\n      (function () {\n        var ua = navigator.userAgent || \"\";\n        var touch = navigator.maxTouchPoints || 0;\n        var isiPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && touch > 1);\n        var isiPhone = /iPhone|iPod/.test(ua);\n        var isIOS = isiPhone || isiPad;\n        var isAndroid = /Android/i.test(ua);\n        var isAndroidPhone = isAndroid && /Mobile/i.test(ua);\n        var isAndroidTablet = isAndroid && !/Mobile/i.test(ua);\n        var minSide = Math.min(screen.width || 0, screen.height || 0);\n        var maxSide = Math.max(screen.width || 0, screen.height || 0);\n\n        var type = \"desktop\";\n        if (isiPhone) type = \"phone\";\n        else if (isiPad || isAndroidTablet) type = \"tablet\";\n        else if (isAndroidPhone) type = \"phone\";\n        else if (touch > 0 && minSide > 0 && minSide <= 500) type = \"phone\";\n        else if (touch > 0 && minSide > 500 && maxSide <= 1400) type = \"tablet\";\n\n        var iosMajor = null;\n        var osToken = null;\n        var safariToken = null;\n        var iphoneOs = ua.match(/iPhone OS (\\d+)[._]/);\n        var ipadOs = ua.match(/CPU OS (\\d+)[._](\\d+) like Mac OS X/);\n        var safariVer = ua.match(/Version\\/(\\d+)[._]/);\n        if (iphoneOs) osToken = parseInt(iphoneOs[1], 10);\n        else if (ipadOs) osToken = parseInt(ipadOs[1], 10);\n        if (isIOS && safariVer) safariToken = parseInt(safariVer[1], 10);\n        if (osToken != null || safariToken != null) {\n          iosMajor = Math.max(osToken || 0, safariToken || 0);\n        }\n\n        var root = document.documentElement;\n        var classes = [\"device-\" + type];\n        if (iosMajor != null) {\n          root.dataset.ios = String(iosMajor);\n          classes.push(iosMajor >= 27 ? \"ios-27-plus\" : \"ios-below-27\");\n        }\n        root.className = classes.join(\" \");\n      })();\n    <\/script>\n  </head>\n  <body>\n    <div class=\"page\">\n      <header class=\"powered\" aria-label=\"Powered by Grok\">\n        <span class=\"powered-by\">Powered by</span>\n        <span class=\"powered-brand\">\n          <img\n            class=\"grok-logo\"\n            src=\"/__grok/install/assets/homescreen/logo-grok.svg\"\n            width=\"14\"\n            height=\"14\"\n            alt=\"\"\n          />\n          <span class=\"powered-grok\">Grok</span>\n        </span>\n      </header>\n\n      <main class=\"content\">\n        <div class=\"ob\" aria-hidden=\"true\">\n          <img\n            class=\"ob-img ob-phone\"\n            src=\"/__grok/install/assets/homescreen/ob-phone.png\"\n            width=\"338\"\n            height=\"294\"\n            alt=\"\"\n          />\n          <img\n            class=\"ob-img ob-ipad\"\n            src=\"/__grok/install/assets/homescreen/ob-ipad.png\"\n            width=\"634\"\n            height=\"294\"\n            alt=\"\"\n          />\n        </div>\n\n        <section class=\"copy\">\n          <h1>Add {{APP_NAME}} to your&nbsp;Home&nbsp;Screen</h1>\n\n          <div class=\"steps\">\n            <p class=\"step step-tap step-ios27\">\n              <span class=\"muted\">Tap</span>\n              <span class=\"glass glass--icon\" aria-hidden=\"true\">\n                <img src=\"/__grok/install/assets/homescreen/glass-puzzle.svg\" width=\"24\" height=\"24\" alt=\"\" />\n              </span>\n              <span class=\"muted loc loc-phone\">in the bottom bar, then</span>\n              <span class=\"muted loc loc-ipad\">in the tool bar, then</span>\n              <span class=\"glass glass--icon\" aria-hidden=\"true\">\n                <img src=\"/__grok/install/assets/homescreen/glass-share.svg\" width=\"24\" height=\"24\" alt=\"\" />\n              </span>\n            </p>\n\n            <p class=\"step step-tap step-ios-legacy\">\n              <span class=\"muted\">Tap</span>\n              <span class=\"glass glass--icon\" aria-hidden=\"true\">\n                <img src=\"/__grok/install/assets/homescreen/glass-share.svg\" width=\"24\" height=\"24\" alt=\"\" />\n              </span>\n              <span class=\"muted loc loc-phone\">in the bottom bar</span>\n              <span class=\"muted loc loc-ipad\">in the tool bar</span>\n            </p>\n\n            <p class=\"step step-select\">\n              <span class=\"muted\">Select</span>\n              <span class=\"add-label\">\n                <img\n                  class=\"plus-icon\"\n                  src=\"/__grok/install/assets/homescreen/plus.svg\"\n                  width=\"16\"\n                  height=\"16\"\n                  alt=\"\"\n                />\n                <span class=\"add-text\">Add to Home Screen</span>\n              </span>\n            </p>\n          </div>\n        </section>\n      </main>\n\n      <main class=\"content content-desktop\">\n        <section class=\"copy\">\n          <h1>Open this link on your iPhone&nbsp;or&nbsp;iPad</h1>\n          <p class=\"desktop-note\">\n            This page shows how to add {{APP_NAME}} to an iOS Home Screen.\n          </p>\n          <a class=\"desktop-open\" href=\"{{APP_URL}}\">Open {{APP_NAME}}</a>\n        </section>\n      </main>\n    </div>\n  </body>\n</html>\n";
//#endregion
//#region scripts/grok-pwa-shared.mjs
/**
* Single source of truth for the platform PWA chrome, shared by the dev/preview
* Vite plugin (scripts/grok-pwa-plugin.mjs) and the deployed-app Nitro
* middleware (server/middleware/grok-pwa.ts). Plain ESM so `node --test` and
* the Nitro bundler can both consume it.
*/
var DEFAULT_APP_NAME = "Grok App";
function escapeHtml(value) {
	return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
/**
* "wild-race.grok.me" → "Wild Race". Host headers are attacker-controlled, so
* anything outside a plain [a-z0-9-] slug falls back to the default name.
*/
function appNameFromHost(hostHeader) {
	const host = String(hostHeader ?? "").split(",")[0].trim().split(":")[0].toLowerCase();
	if (!host || host === "localhost" || host.endsWith(".local") || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return DEFAULT_APP_NAME;
	const slug = host.split(".")[0] ?? "";
	if (!slug || slug === "www" || !/^[a-z0-9-]{1,63}$/.test(slug)) return DEFAULT_APP_NAME;
	return slug.split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") || "Grok App";
}
function isInstallQuery(url) {
	const query = String(url ?? "").split("?", 2)[1] ?? "";
	const params = new URLSearchParams(query);
	const install = params.get("install");
	const platform = (params.get("platform") ?? "").toLowerCase();
	return (install === "1" || install === "true") && platform === "ios";
}
/** Paths that can carry an app document (vs assets / API / internals). */
function isDocumentPath(pathname) {
	const path = String(pathname ?? "");
	return !path.startsWith("/__grok/") && !path.startsWith("/api/") && !path.startsWith("/@") && !path.startsWith("/node_modules") && !/\.[a-z0-9]+$/i.test(path);
}
function acceptsHtml(accept) {
	const value = String(accept ?? "");
	return value === "" || value.includes("text/html") || value.includes("*/*");
}
/** The same URL without the install-tutorial params (used as the app link). */
function stripInstallParams(url) {
	const [path = "/", query = ""] = String(url ?? "/").split("?", 2);
	const params = new URLSearchParams(query);
	params.delete("install");
	params.delete("platform");
	const rest = params.toString();
	return rest ? `${path}?${rest}` : path;
}
function renderInstallPageHtml(template, { host, url } = {}) {
	return String(template).replaceAll("{{APP_NAME}}", escapeHtml(appNameFromHost(host))).replaceAll("{{APP_URL}}", escapeHtml(stripInstallParams(url)));
}
function renderWebManifest(hostHeader) {
	const name = appNameFromHost(hostHeader);
	return JSON.stringify({
		name,
		short_name: name,
		id: "/",
		start_url: "/",
		scope: "/",
		display: "standalone",
		background_color: "#0a0612",
		theme_color: "#0a0612",
		icons: [{
			src: "/__grok/nlo-180.png",
			sizes: "180x180",
			type: "image/png"
		}, {
			src: "/__grok/nlo-192.png",
			sizes: "192x192",
			type: "image/png"
		}, {
			src: "/__grok/nlo-512.png",
			sizes: "512x512",
			type: "image/png"
		}]
	}, null, 2);
}
function grokPwaHeadTags(appName = DEFAULT_APP_NAME) {
	return [
		["manifest", "<link rel=\"manifest\" href=\"/__grok/manifest.webmanifest\">"],
		["apple-touch-icon", "<link rel=\"apple-touch-icon\" href=\"/__grok/nlo-180.png\">"],
		["apple-mobile-web-app-title", `<meta name="apple-mobile-web-app-title" content="${escapeHtml(appName)}">`],
		["apple-mobile-web-app-status-bar-style", "<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black\">"],
		["theme-color", "<meta name=\"theme-color\" content=\"#000000\">"],
		["twitter:card", "<meta name=\"twitter:card\" content=\"summary_large_image\">"]
	];
}
var GROK_EXTENSIONS_SCRIPT_SRC = "https://grok.com/grok-app-builder/extensions.js";
function readGrokProjectId() {
	const fromProcess = typeof process !== "undefined" ? process.env?.VITE_PROJECT_ID : "";
	return String(fromProcess ?? "").trim();
}
function readXCreator() {
	const fromProcess = typeof process !== "undefined" ? process.env?.X_CREATOR : "";
	return String(fromProcess ?? "").trim();
}
function readXCreatorId() {
	const fromProcess = typeof process !== "undefined" ? process.env?.X_CREATOR_ID : "";
	return String(fromProcess ?? "").trim();
}
function grokXCreatorHeadTags(creator = readXCreator(), creatorId = readXCreatorId()) {
	const name = String(creator ?? "").trim();
	const id = String(creatorId ?? "").trim();
	if (!name || !id) return [];
	return [`<meta property="x:creator" content="${escapeHtml(name)}">`, `<meta property="x:creator:id" content="${escapeHtml(id)}">`];
}
/** Platform "Created with Grok" banner — injected into every HTML document. */
function grokExtensionsHeadTags(projectId = readGrokProjectId()) {
	const id = escapeHtml(projectId);
	const tags = [];
	if (projectId) tags.push(`<meta name="grok-project-id" content="${id}">`);
	tags.push(`<script src="${GROK_EXTENSIONS_SCRIPT_SRC}"${projectId ? ` data-project-id="${id}"` : ""} defer><\/script>`);
	return tags;
}
function injectGrokPwaHead(html, appName = DEFAULT_APP_NAME, projectId = readGrokProjectId(), creator = readXCreator(), creatorId = readXCreatorId()) {
	if (typeof html !== "string") return html;
	const missing = grokPwaHeadTags(appName).filter(([key]) => {
		if (key === "manifest") return !html.includes("href=\"/__grok/manifest.webmanifest\"");
		if (key === "apple-touch-icon") return !html.includes("href=\"/__grok/nlo-180.png\"") && !html.includes("href=\"/__grok/icon-180.png\"");
		if (key === "twitter:card") return !html.includes("name=\"twitter:card\"") && !html.includes("name='twitter:card'") && !html.includes("property=\"twitter:card\"");
		return !html.includes(`name="${key}"`);
	}).map(([, tag]) => tag);
	if (!html.includes("/grok-app-builder/extensions.js")) missing.push(...grokExtensionsHeadTags(projectId));
	else if (projectId && !html.includes("name=\"grok-project-id\"")) missing.push(`<meta name="grok-project-id" content="${escapeHtml(projectId)}">`);
	if (projectId && !html.includes("property=\"grok:app_id\"") && !html.includes("property='grok:app_id'")) missing.push(`<meta property="grok:app_id" content="${escapeHtml(projectId)}">`);
	const creatorTags = grokXCreatorHeadTags(creator, creatorId);
	if (creatorTags.length > 0) {
		if (!(html.includes("property=\"x:creator\" content=") || html.includes("property='x:creator' content="))) missing.push(creatorTags[0]);
		if (!html.includes("property=\"x:creator:id\"")) missing.push(creatorTags[1]);
	}
	if (missing.length === 0) return html;
	const snippet = missing.join("");
	if (html.includes("</head>")) return html.replace("</head>", `${snippet}</head>`);
	if (html.includes("<head>")) return html.replace("<head>", `<head>${snippet}`);
	return html;
}
var HEAD_CLOSE = Buffer.from("</head>");
/**
* Streaming head injector: buffers only until `</head>` (multi-byte safe — the
* marker is pure ASCII, which never appears inside a UTF-8 continuation byte),
* injects any missing tags there, then passes every later chunk through
* untouched so streaming SSR keeps streaming.
*/
function createHeadInjector(appName = DEFAULT_APP_NAME, projectId = readGrokProjectId(), creator = readXCreator(), creatorId = readXCreatorId()) {
	/** @type {Buffer[]} */
	let pending = [];
	let done = false;
	return {
		/** @param {Uint8Array | string} chunk @returns {Buffer[]} chunks ready to emit */
		push(chunk) {
			const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
			if (done) return [buf];
			pending.push(buf);
			const joined = Buffer.concat(pending);
			const at = joined.indexOf(HEAD_CLOSE);
			if (at === -1) return [];
			done = true;
			pending = [];
			const head = injectGrokPwaHead(joined.subarray(0, at).toString("utf8") + "</head>", appName, projectId, creator, creatorId);
			return [Buffer.concat([Buffer.from(head, "utf8"), joined.subarray(at + HEAD_CLOSE.length)])];
		},
		/** @returns {Buffer[]} whatever is still buffered (no `</head>` seen) */
		flush() {
			if (done || pending.length === 0) return [];
			const rest = Buffer.concat(pending);
			pending = [];
			done = true;
			return [Buffer.from(injectGrokPwaHead(rest.toString("utf8"), appName, projectId, creator, creatorId), "utf8")];
		}
	};
}
//#endregion
//#region server/middleware/grok-pwa.ts
/**
* Deployed-app (Nitro) half of the platform PWA chrome. Auto-registered as
* global h3 middleware because vite.config.ts sets `serverDir: "./server"` —
* without that option Nitro v3 never scans this directory.
*
* - `?install=1&platform=ios` on a document path → the Home Screen tutorial,
*   bundled into the server build via `?raw` (the public/ directory is CDN
*   static output on Vercel and not readable from the function).
* - `/__grok/manifest.webmanifest` → per-app-named manifest (kept out of
*   public/ so this dynamic response is the only one).
* - Other HTML documents → stream-inject missing PWA head tags at `</head>`.
*   This must be a middleware transforming `next()`: h3 discards the `response`
*   runtime hook's return value, and `render:html` does not exist in Nitro v3.
*/
function requestHost(event) {
	return event.req.headers.get("x-forwarded-host") ?? event.req.headers.get("host") ?? event.url.host;
}
function injectHeadStreaming(response, appName) {
	const injector = createHeadInjector(appName);
	const transformed = response.body.pipeThrough(new TransformStream({
		transform(chunk, controller) {
			for (const out of injector.push(chunk)) controller.enqueue(out);
		},
		flush(controller) {
			for (const out of injector.flush()) controller.enqueue(out);
		}
	}));
	const headers = new Headers(response.headers);
	headers.delete("content-length");
	return new Response(transformed, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}
async function grokPwaMiddleware(event, next) {
	if ((event.req.method ?? "GET").toUpperCase() !== "GET") return next();
	const path = event.url.pathname;
	const urlWithQuery = path + event.url.search;
	if (path === "/__grok/manifest.webmanifest" || path === "/__grok/manifest.json") return new Response(renderWebManifest(requestHost(event)), { headers: {
		"content-type": "application/manifest+json; charset=utf-8",
		"cache-control": "no-cache"
	} });
	if (isInstallQuery(urlWithQuery) && isDocumentPath(path) && acceptsHtml(event.req.headers.get("accept"))) {
		const html = renderInstallPageHtml(install_page_default, {
			host: requestHost(event),
			url: urlWithQuery
		});
		return new Response(html, { headers: {
			"content-type": "text/html; charset=utf-8",
			"cache-control": "no-cache"
		} });
	}
	if (!isDocumentPath(path)) return next();
	const result = await next();
	if (result instanceof Response && result.body && String(result.headers.get("content-type") ?? "").includes("text/html") && !result.headers.get("content-encoding")) return injectHeadStreaming(result, appNameFromHost(requestHost(event)));
	return result;
}
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_IO091Z = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_IO091Z
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
var globalMiddleware = [toEventHandler(static_default), toEventHandler(grokPwaMiddleware)].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		middleware.push(...h3App["~middleware"]);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region #nitro/virtual/tracing
var tracingSrvxPlugins = [];
//#endregion
//#region node_modules/nitro/dist/presets/node/runtime/node-server.mjs
var _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
var port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
var host = process.env.NITRO_HOST || process.env.HOST;
var cert = process.env.NITRO_SSL_CERT;
var key = process.env.NITRO_SSL_KEY;
var nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch,
	plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };
