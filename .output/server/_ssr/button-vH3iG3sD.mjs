import "../_runtime.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-BqCTpu3b.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { H as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-display text-base font-medium transition-transform duration-150 ease-out select-none mc-bevel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50 active:translate-y-px min-h-11 px-4", {
	variants: {
		variant: {
			default: "bg-accent text-accent-foreground hover:brightness-110",
			oak: "tex-oak text-foreground hover:brightness-110",
			stone: "tex-stone text-foreground hover:brightness-110",
			ghost: "bg-transparent text-foreground shadow-none hover:bg-foreground/8",
			gold: "bg-gold text-gold-foreground hover:brightness-110"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-sm",
			lg: "h-12 px-5 text-lg"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
//#endregion
export { Button as t };
