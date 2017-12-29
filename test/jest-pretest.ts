import "aurelia-polyfills";
import { Options } from "aurelia-loader-nodejs";
import { globalize } from "aurelia-pal-nodejs";
import * as path from "path";
import "./shims/user-performance";

Options.relativeToDir = path.join(__dirname, "unit");
globalize();
