import { AuthorizeData } from "./migrationService/serviceBase";
import { PkgMigrationService } from "./migrationService/package";
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

  const sourceAuthorizeData: AuthorizeData = {
    TOKEN:
      process.env.SOURCE_TOKEN || core.getInput("SOURCE_TOKEN") || "",
    API_SERVER:
      getAPIServer(process.env.SOURCE_API_SERVER ||
        core.getInput("SOURCE_API_SERVER") ||
        "https://api.skedulo.com/"),
    ORG_NAME: process.env.SOURCE_ORG_NAME || core.getInput("SOURCE_ORG_NAME") || "Testing",
  }

  const targetAuthorizeData: AuthorizeData = {
    TOKEN:
      process.env.DEST_TOKEN || core.getInput("TARGET_TOKEN") || "",
    API_SERVER:
      getAPIServer(process.env.TARGET_API_SERVER ||
        core.getInput("TARGET_API_SERVER") ||
        "https://api.skedulo.com/"),
    ORG_NAME: process.env.TARGET_ORG_NAME || core.getInput("TARGET_ORG_NAME") || "Testing",
  }

  return await (new PkgMigrationService(sourceAuthorizeData, targetAuthorizeData)).migration()

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
