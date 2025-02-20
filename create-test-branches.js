const { execSync } = require("child_process");

const branchConfigs = [
  { pattern: "feature/", count: 10 },
  { pattern: "test/", count: 10 },
  { pattern: "release/", count: 10 },
  { pattern: "revert-", count: 10 },
];

function createBranch(branchName, daysOld) {
  try {
    execSync(`git branch ${branchName}`, { stdio: "pipe" });

    const commitDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const dateStr = commitDate.toISOString();

    execSync(
      `echo "// ${branchName} - ${daysOld} days old" > test/branch/${branchName.replace(
        /[\/\-]/g,
        "_"
      )}.txt`,
      { stdio: "pipe" }
    );
    execSync(`git add .`, { stdio: "pipe" });
    execSync(`git commit -m "Add ${branchName}" --date="${dateStr}"`, {
      stdio: "pipe",
      env: { ...process.env, GIT_COMMITTER_DATE: dateStr },
    });
    execSync(`git push origin ${branchName}`, { stdio: "pipe" });

    console.log(`✅ Created ${branchName} (${daysOld} days old)`);
  } catch (error) {
    console.log(`❌ Failed to create ${branchName}: ${error.message}`);
  }
}

function generateBranchName(pattern, index) {
  if (pattern === "revert-") {
    return `${pattern}${Math.floor(Math.random() * 10000)}-fix-issue-${index}`;
  }
  return `${pattern}branch-${index.toString().padStart(3, "0")}`;
}

function getRandomAge() {
  if (Math.random() < 0.7) {
    return Math.floor(Math.random() * 200) + 91; // 91-290 days (stale)
  } else {
    return Math.floor(Math.random() * 89) + 1; // 1-89 days (fresh)
  }
}

async function main() {
  try {
    execSync("git checkout main", { stdio: "pipe" });
  } catch (error) {
    console.log("Could not checkout main branch, continuing...");
  }

  let totalCreated = 0;
  let staleCount = 0;

  for (const config of branchConfigs) {
    console.log(
      `\nCreating ${config.count} branches with pattern: ${config.pattern}`
    );

    for (let i = 1; i <= config.count; i++) {
      const branchName = generateBranchName(config.pattern, i);
      const daysOld = getRandomAge();

      if (daysOld > 90) staleCount++;

      createBranch(branchName, daysOld);
      totalCreated++;
    }
  }

  try {
    execSync("git checkout main", { stdio: "pipe" });
  } catch (error) {
    console.log("Could not return to main branch");
  }

  console.log(`\nBranch creation completed!`);
  console.log(`Total branches created: ${totalCreated}`);
  console.log(`Stale branches (>90 days): ${staleCount}`);
  console.log(`Fresh branches (<90 days): ${totalCreated - staleCount}`);
}

main().catch(console.error);
