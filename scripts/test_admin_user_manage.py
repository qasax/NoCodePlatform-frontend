from playwright.sync_api import sync_playwright

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 为了记录过程，也可以打开调试信息或者保留录像
        context = browser.new_context()
        page = context.new_page()

        # 开始测试：先登录管理员账号
        print("1. 导航到登录页面...")
        page.goto('http://localhost:5173/user/login')
        page.wait_for_load_state('networkidle')

        print("2. 执行登录操作（假设存在 admin 账号为 testadmin 密码随意前提不校验/或确保已存在的admin号）...")
        # 注意: 之前的测试中并没有说明系统里有一个现成的 admin 权限账号。
        # 此处我们将先尝试注册一个 admin，或者用已知账号登录。
        # 由于我们无法直接操作数据库，可以先尝试使用一个普通账号注册登录。
        # 但是这里测试的是 "用户管理模块"，该模块只有 admin 可见。
        # 如果当前无管理账号，此测试会卡住。
        # 为了安全，我们先尝试填入一个账号名 admin 密码 12345678。
        # 此用例更倾向于假设系统已有 admin。
        page.fill('input[placeholder="请输入账号"]', 'admin')
        page.fill('input[placeholder="请输入密码"]', '12345678')
        page.click('button:has-text("登录")')

        page.wait_for_timeout(2000) # 等待登录回调
        print("检查当前 URL:", page.url)

        # 验证跳转和菜单显示
        print("3. 导航到用户管理页面...")
        page.goto('http://localhost:5173/admin/userManage')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(1000)

        # 检查是否成功进入
        title = page.title()
        print("目前页面标题或 URL: ", page.url)
        if "login" in page.url or page.url == "http://localhost:5173/":
             print("无法进入用户管理，可能是权限不够。尝试截图...")
             page.screenshot(path='/tmp/admin_permission_fail.png')
             browser.close()
             return

        # 点击新建用户
        print("4. 测试新建用户...")
        page.click('button:has-text("新建用户")')
        page.wait_for_selector('.ant-modal-content')
        
        page.fill('input[placeholder="请输入账号"]', 'playwright_test1')
        page.fill('input[placeholder="请输入至少8位密码"]', '12345678')
        page.fill('input[placeholder="请输入昵称"]', 'PW 测试用户')
        # 角色保持默认或选择
        page.click('.ant-modal-content button:has-text("确 定")')
        
        page.wait_for_timeout(2000)
        
        # 测试搜索
        print("5. 测试搜索功能...")
        page.fill('input[placeholder="请输入账号"]', 'playwright_test1')
        page.click('.search-form button:has-text("搜 索")')
        page.wait_for_timeout(1000)
        page.screenshot(path='/tmp/search_result.png')

        # 如果找到可以点击删除
        print("6. 测试删除...")
        try:
            page.click('a.danger-text')
            page.wait_for_selector('.ant-popover')
            page.click('.ant-popover button:has-text("确 定")')
            page.wait_for_timeout(1000)
            print("删除完成。")
        except Exception as e:
            print("未能找到删除按钮或者执行删除失败：", e)
        
        browser.close()
        print("测试流程执行完毕。")

if __name__ == '__main__':
    run_test()
