for branch in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin/ | grep -v 'main$'); do
  gh pr create --head "${branch#origin/}" --base main --title "PR from ${branch#origin/}" --body "Auto-created PR from ${branch#origin/}"
done
