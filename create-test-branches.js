#!/usr/bin/env node

/**
 * Script to create test branches for testing stale branch deletion
 * Usage: node create-test-branches.js
 */

const { execSync } = require("child_process");

// Branch configurations
const branchConfigs = [
  { pattern: "feature/", count: 12 },
  { pattern: "test/", count: 50 },
  { pattern: "release/", count: 50 },
  { pattern: "revert-", count: 50 },
];

function createBranch(branchName, daysOld) {
  try {
    // Create branch
    execSync(`git branch ${branchName}`, { stdio: "pipe" });

    // Create a commit with backdated timestamp
    const commitDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const dateStr = commitDate.toISOString();

    // Create a small change
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
  // Generate random ages: 70% > 90 days (stale), 30% < 90 days (fresh)
  if (Math.random() < 0.7) {
    return Math.floor(Math.random() * 200) + 91; // 91-290 days (stale)
  } else {
    return Math.floor(Math.random() * 89) + 1; // 1-89 days (fresh)
  }
}

async function main() {
  console.log("🚀 Starting test branch creation...\n");

  // Ensure we're on main branch
  try {
    execSync("git checkout main", { stdio: "pipe" });
  } catch (error) {
    console.log("⚠️  Could not checkout main branch, continuing...");
  }

  let totalCreated = 0;
  let staleCount = 0;

  for (const config of branchConfigs) {
    console.log(
      `\n📝 Creating ${config.count} branches with pattern: ${config.pattern}`
    );

    for (let i = 1; i <= config.count; i++) {
      const branchName = generateBranchName(config.pattern, i);
      const daysOld = getRandomAge();

      if (daysOld > 90) staleCount++;

      createBranch(branchName, daysOld);
      totalCreated++;

      // Progress indicator
      if (i % 50 === 0) {
        console.log(
          `   Progress: ${i}/${config.count} (${Math.round(
            (i / config.count) * 100
          )}%)`
        );
      }
    }
  }

  // Return to main branch
  try {
    execSync("git checkout main", { stdio: "pipe" });
  } catch (error) {
    console.log("⚠️  Could not return to main branch");
  }

  console.log(`\n🎉 Branch creation completed!`);
  console.log(`📊 Total branches created: ${totalCreated}`);
  console.log(`🗑️  Stale branches (>90 days): ${staleCount}`);
  console.log(`🌱 Fresh branches (<90 days): ${totalCreated - staleCount}`);
  console.log(`\n💡 Run the GitHub Action to test stale branch deletion`);
}

main().catch(console.error);
