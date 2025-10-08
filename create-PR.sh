for branch in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin/ | grep -v 'main$'); do
  gh pr create --head "${branch#origin/}" --base main --title "PR from ${branch#origin/}" --body "Auto-created PR from ${branch#origin/}"
done

# - Học được grep -v : loại bỏ những ai trùng và giữ những đứa còn lại
# - học được 'main$' là so với cuối chuỗi nếu ko có $ thì là so với đầu chuỗi
# - Học được Biểu thức ${branch#origin/} là một cú pháp "parameter expansion" (mở rộng tham số) trong Bash (shell scripting), dùng để cắt (xoá) một phần chuỗi từ biến.
