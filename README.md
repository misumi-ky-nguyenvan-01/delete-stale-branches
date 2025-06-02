# Delete Stale Branches

Tự động xóa các branch cũ (>90 ngày) không có cập nhật mới.

## Cải thiện so với version gốc

### Logic gốc có vấn đề:
- ❌ Chỉ xử lý `feature/*` branches
- ❌ Giới hạn 100 branches (không đủ với số lượng lớn)
- ❌ Không có pagination
- ❌ Thiếu error handling

### Logic cải thiện:
- ✅ Xử lý tất cả patterns: `feature/*`, `test/*`, `release/*`, `revert-*`
- ✅ Pagination để lấy tất cả branches
- ✅ Error handling đầy đủ
- ✅ Logging chi tiết với thống kê
- ✅ Hiển thị số ngày của từng branch

## Sử dụng

### 1. Tạo test branches
```bash
npm run create-branches
```

Sẽ tạo:
- 740 `feature/*` branches
- 268 `test/*` branches  
- 240 `release/*` branches
- 62 `revert-*` branches

70% branches sẽ > 90 ngày (stale), 30% < 90 ngày (fresh)

### 2. Chạy GitHub Action
- Push code lên GitHub
- Action sẽ tự động chạy và xóa stale branches
- Xem logs để kiểm tra kết quả

## Files

- `.github/workflows/delete-stale-branches.yml` - Logic gốc
- `.github/workflows/delete-stale-branches-improved.yml` - Logic cải thiện
- `create-test-branches.js` - Script tạo test branches
- `package.json` - NPM configuration

## Lưu ý

⚠️ **Cẩn thận khi chạy trên repo thật** - Script sẽ xóa branches thật sự!

Nên test trên repo riêng trước khi áp dụng vào production.