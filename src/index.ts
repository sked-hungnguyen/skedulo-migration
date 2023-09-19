import { PkgMigrationService, AuthorizeData } from "./pkgMigrationService";
import * as dotenv from "dotenv";
import * as core from "@actions/core";

dotenv.config();

const getAPIServer = (url: string) => {
  // if end with / remove it
  if (url[url.length - 1] === "/") {
    url = url.slice(0, -1);
  }

  return url;
}

async function migrationPackages() {

  const originAuthorizeData: AuthorizeData = {
    TOKEN:
      process.env.ORIGIN_TOKEN || core.getInput("ORIGIN_TOKEN") || "",
    API_SERVER:
      getAPIServer(process.env.ORIGIN_API_SERVER ||
        core.getInput("ORIGIN_API_SERVER") ||
        "https://api.skedulo.com/"),
    ORG_NAME: process.env.ORIGIN_ORG_NAME || core.getInput("ORIGIN_ORG_NAME") || "Testing",
  }

  const destAuthorizeData: AuthorizeData = {
    TOKEN:
      process.env.DEST_TOKEN || core.getInput("DEST_TOKEN") || "",
    API_SERVER:
      getAPIServer(process.env.DEST_API_SERVER ||
        core.getInput("DEST_API_SERVER") ||
        "https://api.skedulo.com/"),
    ORG_NAME: process.env.DEST_ORG_NAME || core.getInput("DEST_ORG_NAME") || "Testing",
  }

  return await (new PkgMigrationService(originAuthorizeData, destAuthorizeData)).migration()

}

(async () => {
  try {
    const time = new Date().toTimeString();
    core.setOutput("Start time", time);
    await migrationPackages()
  } catch (error: any) {
    core.setFailed(error.message)
  }
})();
