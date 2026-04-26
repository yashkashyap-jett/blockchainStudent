import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Deploying StudentManagement contract...");

  const StudentManagement = await hre.ethers.getContractFactory("StudentManagement");
  const studentManagement = await StudentManagement.deploy();

  await studentManagement.waitForDeployment();
  const address = await studentManagement.getAddress();

  console.log("StudentManagement deployed to:", address);

  const destDir = path.join(__dirname, '..', 'src', 'lib', 'contracts');
  if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
  }

  const sourceFile = path.join(__dirname, '..', 'artifacts', 'contracts', 'StudentManagement.sol', 'StudentManagement.json');
  const destFile = path.join(destDir, 'StudentManagement.json');
  
  fs.copyFileSync(sourceFile, destFile);
  console.log(`ABI copied to ${destFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
