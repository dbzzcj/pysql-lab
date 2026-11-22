/* PySQL Lab · 关卡内容（一）：阶段一 ~ 阶段四（第 1–27 关）
   写法约定：[[x]] = 行内代码，~~~ = 代码块，## = 小标题，> = 提示
   SQL 片段都可以直接对着 demo.db 试跑。 */

window.STAGE_NAMES = {
  1: '阶段一 · 起步（Python 长什么样）',
  2: '阶段二 · 容器（表与行的另一种写法）',
  3: '阶段三 · 控制流与函数',
  4: '阶段四 · 模块 / 文件 / 异常',
  5: '阶段五 · 面向对象',
  6: '阶段六 · 迭代器 / 生成器 / 装饰器',
  7: '阶段七 · SQL → pandas（核心）',
  8: '阶段八 · 数据库与 ETL',
  9: '阶段九 · 工程化与进阶'
};

window.LEVELS = [
/* ============ 阶段一 · 起步 ============ */
{
  id: 'b01', stage: 1, title: '第一个 print：Python 的基本样子',
  goal: '输出、注释、缩进——先把"能跑起来"这件事解决掉',
  lesson: `Python 只有一件事必须记住：**缩进就是语法**。SQL 里你换行、对齐随便写，Python 里缩进错了直接报错。

- [[print(...)]] 往屏幕输出，可以一次输出多个值，用逗号隔开
- [[#]] 后面是注释，和 SQL 的 [[--]] 注释一个意思
- 字符串用单引号或双引号都行，成对即可

~~~python
print("Hello")          # 输出一行
print("金额", 120.5)     # 输出两个值：金额 120.5
~~~`,
  sql: `-- SQL 里"输出一个值"就是 SELECT 一个常量
SELECT 'Hello PySQL' AS greeting;`,
  py: `# Python 里"输出一个值"就是 print
print('Hello PySQL')`,
  note: 'SQL 的 SELECT 返回结果集给客户端；Python 的 print 把值写到标准输出。目的都是"让结果被人看见"。',
  task: `用 [[print]] 输出两行，**顺序和内容都要完全一致**：

- 第一行：[[Hello PySQL]]
- 第二行：[[我的第 1 关]]`,
  starter: `# 第一行
print("Hello")

# 第二行
print("改我")`,
  check: `assert len(_captured) >= 2, '要输出两行，现在只有 %d 行' % len(_captured)
assert _captured[0].strip() == 'Hello PySQL', '第一行应该是 Hello PySQL，你现在是：%r' % _captured[0]
assert _captured[1].strip() == '我的第 1 关', '第二行应该是 我的第 1 关，你现在是：%r' % _captured[1]`,
  hint: '每行一个 print，把第一个 print 里的字符串改对，第二个 print 也改成任务要的文字。',
  answer: `print('Hello PySQL')
print('我的第 1 关')`
},
{
  id: 'b02', stage: 1, title: '变量与类型：int / float / str / bool / None',
  goal: '把 SQL 的列类型映射到 Python 的类型上',
  lesson: `Python 的变量不用声明类型，赋值就创建：

- [[int]] 整数 ←→ SQL 的 [[INTEGER / NUMBER]]
- [[float]] 小数 ←→ [[NUMBER / DECIMAL]]（Python 只有 float，没有定点数）
- [[str]] 字符串 ←→ [[VARCHAR / TEXT]]
- [[bool]] 只有 [[True]] / [[False]] ←→ SQL 的 [[BOOLEAN]]（Oracle 里是 [[NUMBER(1)]]
- [[None]] 空值 ←→ SQL 的 [[NULL]]（注意是 None，不是 null）

用 [[type(x)]] 查看类型。`,
  sql: `SELECT 1001 AS order_id, 120.5 AS amount,
       '深圳' AS city, 1 AS is_paid
FROM (SELECT 1);`,
  py: `order_id = 1001        # int
amount = 120.5         # float
city = '深圳'          # str
is_paid = True         # bool
empty = None           # 空值，等于 SQL 的 NULL

print(type(order_id))  # <class 'int'>`,
  note: 'SQL 建表时类型写死在 DDL 里；Python 是"值决定类型"，同一个变量可以先放整数再放字符串。代价是类型错了运行时才炸。',
  task: `定义四个变量并各打印一次类型：[[n = 14]]（整数）、[[rate = 0.06]]（小数）、[[city = '广州']]（字符串）、[[flag = False]]（布尔）。`,
  starter: `n = 14
rate = 0.06
city = "深圳"
flag = True

print(type(n))
# 后面的三个自己补`,
  check: `assert n == 14 and isinstance(n, int), 'n 要是整数 14'
assert abs(rate - 0.06) < 1e-9 and isinstance(rate, float), 'rate 要是小数 0.06'
assert city == '广州', 'city 要是字符串 广州'
assert flag is False, 'flag 要改成 False（注意大写 F）'
assert len(_captured) >= 4, '四个 type() 都要 print 出来'`,
  hint: '照第一行的样子，给 rate、city、flag 各写一行 print(type(变量名))。',
  answer: `n = 14
rate = 0.06
city = "广州"
flag = False

print(type(n))
print(type(rate))
print(type(city))
print(type(flag))`
},
{
  id: 'b03', stage: 1, title: 'f-string：Python 的字符串拼接',
  goal: '替代 CONCAT / || ，顺便学会格式化小数',
  lesson: `SQL 拼字符串用 [[||]] 或 [[CONCAT()]]，Python 用 **f-string**：字符串前面加 [[f]]，里面用 [[{变量}]] 直接插值。

~~~python
name = "深圳"
n = 3
print(f"{name} 有 {n} 条订单")     # 深圳 有 3 条订单
print(f"{120.5:.2f} 元")           # 120.50 元 ← :.2f 表示保留两位
~~~
[[{amount:.2f}]] 就是"格式说明符"，等价于 SQL 的 [[ROUND(amount, 2)]]，但保留末尾的 0。`,
  sql: `-- SQL 拼接 + 四舍五入
SELECT '订单 ' || order_id || ' 金额 ' || ROUND(amount, 2) || ' 元' AS line
FROM orders
WHERE order_id = 1001;`,
  py: `order_id = 1001
amount = 120.5
print(f'订单 {order_id} 金额 {amount:.2f} 元')`,
  note: 'SQL 里 ROUND 只影响数值本身（120.5 变 120.5，末尾不会补 0）；f-string 的 :.2f 是"显示成两位"，输出 120.50。生成报表文本时这个差别很关键。',
  task: `完成这段代码，让它**恰好**输出：[[订单 1001 金额 120.50 元]]`,
  starter: `order_id = 1001
amount = 120.5

print("订单", order_id, "金额", amount, "元")`,
  check: `assert _captured, '要用 print 输出'
last = _captured[-1].strip()
assert last == '订单 1001 金额 120.50 元', '输出要正好是「订单 1001 金额 120.50 元」，你现在是：%r（提示：用 f-string 和 :.2f）' % last`,
  hint: '把 print 改成一个 f-string：f"订单 {order_id} 金额 {amount:.2f} 元"。注意 {} 里不能有空格问题。',
  answer: `order_id = 1001
amount = 120.5

print(f"订单 {order_id} 金额 {amount:.2f} 元")`
},
{
  id: 'b04', stage: 1, title: '运算符：除法有三种',
  goal: 'Python 的 / 和 // 是两回事，这是 SQL 转过来最容易踩的坑',
  lesson: `SQL 的整数相除，各数据库行为还不一样（Oracle 会得到小数，MySQL 取整）。Python 直接给你两种：

- [[/]] 真除法：[[7 / 2]] → [[3.5]]（永远是小数）
- [[//]] 地板除：[[7 // 2]] → [[3]]（向下取整，等价 SQL 的 [[FLOOR(a/b)]]）
- [[%]] 取模：[[7 % 2]] → [[1]]（等价 SQL 的 [[MOD(a,b)]]）
- [[**]] 幂：[[2 ** 10]] → [[1024]]（SQL 里是 [[POWER(2,10)]]）

> 算钱的时候一律用 [[/]]，别用 [[//]]，否则 0.5 元会被吃掉。`,
  sql: `SELECT 7 / 2  AS 商_整数除法,
       7 % 2  AS 余数,
       1024   AS 幂;`,
  py: `print(7 / 2)    # 3.5   真除法
print(7 // 2)   # 3     地板除
print(7 % 2)    # 1     取模
print(2 ** 10)  # 1024  幂`,
  note: 'SQLite 里 7/2 = 3（整数除法），和 Python 的 // 一致；而 Oracle 里 7/2 = 3.5，和 Python 的 / 一致。跨库写 SQL 时这个差异经常导致对数。',
  task: `算出三个变量并打印：[[q]] = 7 用 [[//]] 除以 2、[[r]] = 7 对 2 取模、[[p]] = 2 的 10 次方。`,
  starter: `q = 7 / 2
r = 7 % 2
p = 2 * 10

print(q, r, p)`,
  check: `assert q == 3, 'q 应该是 3（提示：用 // 而不是 /）'
assert r == 1, 'r 应该是 1'
assert p == 1024, 'p 应该是 1024（提示：用 ** 而不是 *）'
assert _captured, '要 print 出来'`,
  hint: '把 q 的 / 换成 //，把 p 的 2 * 10 换成 2 ** 10。',
  answer: `q = 7 // 2
r = 7 % 2
p = 2 ** 10

print(q, r, p)`
},
{
  id: 'b05', stage: 1, title: '类型转换：int() / float() / str()',
  goal: 'CSV 读进来的东西全是字符串，转换是 ETL 的第一步',
  lesson: `SQL 用 [[CAST(x AS INTEGER)]]，Python 用**类型名当函数**：

- [[int('1001')]] → [[1001]]
- [[float('88.5')]] → [[88.5]]
- [[str(120.5)]] → [['120.5']]
- [[round(120.456, 2)]] → [[120.46]]

> ETL 里最常见的一步：CSV/接口拿到的金额是字符串 [['120.50']]，必须先 [[float()]] 才能参与计算，否则会变成字符串拼接。`,
  sql: `SELECT CAST('1001' AS INTEGER) AS id,
       CAST('88.5' AS REAL)    AS amt,
       ROUND(120.456, 2)       AS rounded;`,
  py: `print(int('1001'))
print(float('88.5'))
print(str(120.5))
print(round(120.456, 2))`,
  note: 'Python 的转换失败会直接抛 ValueError（对一个非数字字符串调 int() 就炸）；SQL 的 CAST 有时会静默给 NULL 或 0。所以 Python 侧必须配异常处理，这就是阶段四要学的。',
  task: `把字符串转换好并打印：
- [[s_id = '1001']] 转成整数存到 [[order_id]]
- [[s_amt = '120.50']] 转成小数存到 [[amount]]
- 用 [[round]] 把 [[3.14159]] 保留两位，结果转成字符串存到 [[pi_str]]（应当是 [['3.14']]）`,
  starter: `s_id = "1001"
s_amt = "120.50"

order_id = s_id
amount = s_amt
pi_str = 3.14159

print(order_id, amount, pi_str)`,
  check: `assert order_id == 1001 and isinstance(order_id, int), 'order_id 要是整数 1001'
assert abs(amount - 120.5) < 1e-9 and isinstance(amount, float), 'amount 要是小数 120.5'
assert pi_str == '3.14', 'pi_str 要是字符串 3.14（先 round 再 str）'
assert _captured, '要 print 出来'`,
  hint: '用 int(s_id)、float(s_amt)、str(round(3.14159, 2))。',
  answer: `s_id = "1001"
s_amt = "120.50"

order_id = int(s_id)
amount = float(s_amt)
pi_str = str(round(3.14159, 2))

print(order_id, amount, pi_str)`
},

/* ============ 阶段二 · 容器 ============ */
{
  id: 'b06', stage: 2, title: 'list：一列值，就是"一组行"',
  goal: 'list 是 Python 里最常用的容器，对应 SQL 的"一列/一组记录"',
  lesson: `[[list]] 用方括号，元素有序、可重复、可修改：[[orders = [1001, 1002, 1003]]]

- 取: [[orders[0]]] 第一个（**从 0 开始**，SQL 的 LIMIT 1 是"第一行"但索引从 0 起）
- 取最后: [[orders[-1]]]
- 追加: [[orders.append(1004)]]
- 长度: [[len(orders)]] ←→ SQL 的 [[COUNT(*)]]
- 求和: [[sum(amounts)]]

> Python 的 [[len()]] 相当于 [[COUNT(*)]]；[[sum()]] 相当于 [[SUM()]]；但都只作用于一个 list，不是一张表。`,
  sql: `SELECT order_id FROM orders ORDER BY order_id LIMIT 3;`,
  py: `ids = [1001, 1002, 1003]
print(ids[0], ids[-1], len(ids))
ids.append(1004)
print(len(ids))`,
  note: 'SQL 的 LIMIT 3 等于 Python 的 ids[:3]；SQL 的 COUNT(*) 等于 len(ids)。先把"表 → list"这一步想通，后面 pandas 就好理解了。',
  task: `已有 [[ids = [1001, 1002, 1003]]] 和 [[amounts = [120.5, 88.0, 45.0]]]：
- 往 ids 追加 1004（用 [[append]]）
- 计算 amounts 的总和存到 [[total]]
- 计算 ids 的元素个数存到 [[cnt]]
- 打印 [[cnt]] 和 [[total]]`,
  starter: `ids = [1001, 1002, 1003]
amounts = [120.5, 88.0, 45.0]

total = 0
cnt = 0

print(cnt, total)`,
  check: `assert ids == [1001, 1002, 1003, 1004], 'ids 应该是追加 1004 之后的 4 个元素'
assert abs(total - 253.5) < 1e-6, 'total 应该是 253.5'
assert cnt == 4, 'cnt 应该是 4（用 len(ids)）'
assert _captured, '要 print 出来'`,
  hint: 'ids.append(1004)；total = sum(amounts)；cnt = len(ids)。注意 cnt 要在 append 之后算。',
  answer: `ids = [1001, 1002, 1003]
amounts = [120.5, 88.0, 45.0]

ids.append(1004)
total = sum(amounts)
cnt = len(ids)

print(cnt, total)`
},
{
  id: 'b07', stage: 2, title: 'dict：一行记录 = 一堆"列名 → 值"',
  goal: 'dict 是 pandas 一行、JSON 一个对象、SQL 一条记录的母语',
  lesson: `[[dict]] 用花括号，存**键值对**：[[{'order_id': 1001, 'city': '深圳'}]]

- 取值: [[d['city']]]
- 改值: [[d['status'] = 'paid']]
- 取不存在的键: [[d.get('vip', 0)]] ← 给默认值，等价 SQL 的 [[COALESCE(col, 0)]]
- 所有键: [[list(d)]]

> 一条 SQL 查询结果的一行，在 Python 里最自然的表示就是一个 dict；一整张表则是 list[dict]——读 API 返回的 JSON 全是这个形状。`,
  sql: `SELECT order_id, city, amount FROM orders WHERE order_id = 1001;`,
  py: `row = {'order_id': 1001, 'city': '深圳', 'amount': 120.5}
print(row['city'])
row['status'] = 'paid'
print(row.get('vip', 0))`,
  note: 'SQL 一次查一行，返回的是"列 → 值"的映射；Python 用 dict 装它。[[get(k, 默认值)]] 就是 [[COALESCE]] 在字典上的等价写法。',
  task: `建一个订单字典存到 [[row]]，包含 [[order_id=1001]]、[[city='深圳']]、[[amount=120.5]]；再给它加一个键 [[status='paid']]；然后用 [[get]] 取 [[note]] 键、默认值 [['无']]，结果存到 [[memo]]；打印 [[row['city']]] 和 [[memo]]。`,
  starter: `row = {"order_id": 1001}

memo = ""

print(row, memo)`,
  check: `assert row.get('order_id') == 1001, 'row 里要有 order_id=1001'
assert row.get('city') == '深圳', 'row 里要有 city=深圳'
assert abs((row.get('amount') or 0) - 120.5) < 1e-9, 'row 里要有 amount=120.5'
assert row.get('status') == 'paid', '再加一个 status=paid'
assert memo == '无', 'memo 应该是 get 的默认值 无'
assert _captured, '要 print 出来'`,
  hint: "row 里直接写四个键；memo = row.get('note', '无')。",
  answer: `row = {"order_id": 1001, "city": "深圳", "amount": 120.5, "status": "paid"}

memo = row.get("note", "无")

print(row["city"], memo)`
},
{
  id: 'b08', stage: 2, title: 'tuple 与解包：一行结果拆成几个变量',
  goal: '数据库驱动返回的每一行，通常就是 tuple',
  lesson: `[[tuple]] 用圆括号，**创建后不能改**：[[(1001, '深圳', 120.5)]]

它最重要的用法是**解包**：

~~~python
row = (1001, '深圳', 120.5)
order_id, city, amount = row     # 一次拆成三个变量
print(order_id, city, amount)
~~~
这就是驱动里 [[for row in cursor]] 出来的样子——每行一个 tuple，按列顺序解包。

> 想改内容就转成 list（[[list(row)]]），改完再转回来。`,
  sql: `SELECT user_id, city FROM users WHERE user_id = 1;`,
  py: `row = (1, '深圳')
user_id, city = row
print(user_id, city)`,
  note: '很多数据库驱动（含 psycopg2、mysql-connector）fetch 出来的行默认就是 tuple，所以你写 Python 处理查询结果时，解包是家常便饭。',
  task: `把 tuple [[row = ('张伟', '深圳', 1)]] 解包成 [[name]]、[[city]]、[[vip]] 三个变量，打印 [[name]]；再把 [[row]] 转成 list 存到 [[row_list]]，把第一个元素改成 [['李娜']]。`,
  starter: `row = ("张伟", "深圳", 1)

name = ""
city = ""
vip = 0
row_list = []

print(name, row_list)`,
  check: `assert name == '张伟' and city == '深圳' and vip == 1, '解包要对：name/city/vip'
assert row_list == ['李娜', '深圳', 1], "row_list 要是 list 并把第一个元素改成 李娜"
assert _captured, '要 print 出来'`,
  hint: 'name, city, vip = row；row_list = list(row) 之后 row_list[0] = "李娜"。',
  answer: `row = ("张伟", "深圳", 1)

name, city, vip = row
row_list = list(row)
row_list[0] = "李娜"

print(name, row_list)`
},
{
  id: 'b09', stage: 2, title: 'set 与去重：SELECT DISTINCT 的 Python 版',
  goal: 'set 天生去重，也是判断"这个值出现过没有"最快的结构',
  lesson: `[[set]] 用花括号但**没有键**：[[{'深圳', '广州'}]]

- 自动去重，重复加进去不会变长
- [[add()]] 添加、[[in]] 判断存在
- 支持交并差：[[a & b]]、[[a | b]]、[[a - b]]
- 长度 [[len(s)]] ←→ [[COUNT(DISTINCT col)]]

> 注意：[[{}]] 是空 dict 不是空 set，空集合要写 [[set()]]。`,
  sql: `SELECT DISTINCT city FROM orders;`,
  py: `cities = ['深圳', '广州', '深圳', '上海']
uniq = set(cities)
print(len(uniq), uniq)`,
  note: 'SELECT DISTINCT city 和 set(cities) 是同一件事：把一列压缩成"不重复的取值"。后面学 groupby 时，你会用它做"每个城市"的分组键。',
  task: `已有 [[cities = ['深圳', '广州', '深圳', '上海', '广州', '北京']]]：
- 去重得到 [[uniq]]（set）
- 去重后的城市个数存到 [[cnt]]
- 打印 [[cnt]] 和 [[uniq]]`,
  starter: `cities = ["深圳", "广州", "深圳", "上海", "广州", "北京"]

uniq = cities
cnt = 0

print(cnt, uniq)`,
  check: `assert isinstance(uniq, set), 'uniq 必须是 set（用 set(cities)）'
assert uniq == {'深圳', '广州', '上海', '北京'}, '去重结果应该是 深圳/广州/上海/北京 四个'
assert cnt == 4, 'cnt 应该是 4'
assert _captured, '要 print 出来'`,
  hint: 'uniq = set(cities)；cnt = len(uniq)。',
  answer: `cities = ["深圳", "广州", "深圳", "上海", "广州", "北京"]

uniq = set(cities)
cnt = len(uniq)

print(cnt, uniq)`
},
{
  id: 'b10', stage: 2, title: '切片：LIMIT / OFFSET / SUBSTR 一次学会',
  goal: 'Python 的 [a:b] 同时承担了分页和截字符串两件事',
  lesson: `切片语法 [[序列[起点:终点:步长]]]，**含起点、不含终点**：

- [[ids[:3]]] 前三个 ←→ [[LIMIT 3]]
- [[ids[2:5]]] 从第 3 个起取 3 个 ←→ [[LIMIT 3 OFFSET 2]]
- [[ids[-2:]]] 最后两个
- [[ids[::2]]] 隔一个取一个
- 字符串同理：[['2026-01-03'[5:7]]] → [['01']] ←→ [[SUBSTR(s, 6, 2)]]

> 记住一句：**左闭右开**。[[ids[0:3]]] 是 0、1、2 三个。`,
  sql: `SELECT order_id FROM orders ORDER BY order_id LIMIT 3 OFFSET 2;`,
  py: `ids = [1001, 1002, 1003, 1004, 1005]
print(ids[:3])    # 前 3 个
print(ids[2:5])   # 第 3~5 个
print(ids[-2:])   # 最后 2 个
print('2026-01-03'[5:7])  # 01`,
  note: 'SQL 的 OFFSET 用"跳过几行"，Python 切片用"从索引几开始"，两者差一位：LIMIT 3 OFFSET 2 = ids[2:2+3] = ids[2:5]。分页脚本里最容易错在这。',
  task: `已有 [[ids = [1001, 1002, 1003, 1004, 1005, 1006]]]]：
- [[first3]] = 前三个
- [[page2]] = 从第 3 个开始取 3 个（等价 LIMIT 3 OFFSET 2）
- [[last2]] = 最后两个
- [[month]] = 从字符串 [['2026-01-03']] 截出月份 [['01']]`,
  starter: `ids = [1001, 1002, 1003, 1004, 1005, 1006]
date_str = "2026-01-03"

first3 = ids
page2 = ids
last2 = ids
month = date_str

print(first3, page2, last2)`,
  check: `assert first3 == [1001, 1002, 1003], 'first3 要是前三个'
assert page2 == [1003, 1004, 1005], 'page2 要是 1003/1004/1005（起点是索引 2）'
assert last2 == [1005, 1006], 'last2 要是最后两个'
assert month == '01', 'month 要是 01'
assert _captured, '要 print 出来'`,
  hint: 'first3 = ids[:3]；page2 = ids[2:5]；last2 = ids[-2:]；month = date_str[5:7]。',
  answer: `ids = [1001, 1002, 1003, 1004, 1005, 1006]
date_str = "2026-01-03"

first3 = ids[:3]
page2 = ids[2:5]
last2 = ids[-2:]
month = date_str[5:7]

print(first3, page2, last2, month)`
},
{
  id: 'b11', stage: 2, title: '列表推导式：一行的 SELECT … WHERE',
  goal: '推导式是 Python 最有辨识度的语法，也是 pandas 之前的"批量计算"',
  lesson: `推导式把"循环 + 追加"压成一行：

~~~python
[表达式 for 变量 in 序列 if 条件]
~~~
- [[[x * 1.1 for x in amounts]]] ←→ [[SELECT amount * 1.1 FROM orders]]（投影）
- [[[x for x in amounts if x > 100]]] ←→ [[SELECT ... WHERE amount > 100]]（过滤）
- 两个一起：[[[x * 1.1 for x in amounts if x > 100]]] ←→ [[SELECT amount*1.1 ... WHERE amount>100]]

> 记住顺序：**先 WHERE（后面的 if）再 SELECT（前面的表达式）**。`,
  sql: `SELECT amount * 1.1 AS 含税
FROM orders
WHERE status = 'paid' AND amount > 100;`,
  py: `amounts = [120.5, 88.0, 45.0, 210.0]
print([a * 1.1 for a in amounts if a > 100])`,
  note: 'SQL 的执行顺序是 FROM → WHERE → SELECT；推导式的写法顺序是 表达式 → for → if，但逻辑一样：先过滤，再计算。',
  task: `已有 [[amounts = [45.0, 88.0, 120.5, 210.0, 320.0]]]]：
- [[taxed]] = 所有金额乘以 1.1（保留原精度即可）
- [[big]] = 只保留大于 100 的金额
- [[big_taxed]] = 大于 100 的金额乘 1.1
- 打印 [[big_taxed]]`,
  starter: `amounts = [45.0, 88.0, 120.5, 210.0, 320.0]

taxed = amounts
big = amounts
big_taxed = amounts

print(big_taxed)`,
  check: `assert isinstance(taxed, list) and len(taxed) == 5, 'taxed 要是 5 个元素的列表（用推导式）'
assert abs(taxed[2] - 132.55) < 1e-6, 'taxed 第 3 个元素应该是 120.5*1.1=132.55'
assert big == [120.5, 210.0, 320.0], 'big 要是大于 100 的三个'
assert len(big_taxed) == 3 and abs(big_taxed[0] - 132.55) < 1e-6, 'big_taxed 要是过滤后再乘 1.1 的三个'`,
  hint: '三个都用推导式：[a * 1.1 for a in amounts]、[a for a in amounts if a > 100]、[a * 1.1 for a in amounts if a > 100]。',
  answer: `amounts = [45.0, 88.0, 120.5, 210.0, 320.0]

taxed = [a * 1.1 for a in amounts]
big = [a for a in amounts if a > 100]
big_taxed = [a * 1.1 for a in amounts if a > 100]

print(big_taxed)`
},
{
  id: 'b12', stage: 2, title: '排序：sorted + key（ORDER BY 的 Python 版）',
  goal: '单列排序、多列排序、升降序混合',
  lesson: `[[sorted(序列, key=函数, reverse=True)]]

- [[sorted(amounts)]] 升序 ←→ [[ORDER BY amount]]
- [[sorted(amounts, reverse=True)]] ←→ [[ORDER BY amount DESC]]
- 对 dict 列表按某个字段排：[[sorted(rows, key=lambda r: r['amount'], reverse=True)]]
- 多列：[[sorted(rows, key=lambda r: (r['city'], -r['amount'])]] —— 城市升序、金额降序（用负号模拟 DESC）

> [[sorted()]] 返回新列表；[[list.sort()]] 原地改。SQL 的 ORDER BY 不改表，所以优先用 [[sorted()]]。`,
  sql: `SELECT city, amount
FROM orders
WHERE status = 'paid'
ORDER BY city ASC, amount DESC;`,
  py: `rows = [{'city': '深圳', 'amount': 120.5}, {'city': '北京', 'amount': 320.0}, {'city': '深圳', 'amount': 410.0}]
sorted_rows = sorted(rows, key=lambda r: (r['city'], -r['amount']))
print(sorted_rows)`,
  note: 'SQL 的 ORDER BY city ASC, amount DESC 在 Python 里就是 key 元组 + 负号。因为 Python 不能对字符串取负，多字段又要求"字段内降序"时，常见做法是先用 operator.itemgetter 排次要字段，再排主字段。',
  task: `已有 [[rows]] 是一个 dict 列表（每个 dict 有 [[city]] 和 [[amount]]）：
- [[by_amount]] = 按金额**降序**排
- [[by_city_amt]] = 先按城市升序、同城市内按金额降序
- 打印 [[by_city_amt]]`,
  starter: `rows = [
    {"city": "深圳", "amount": 120.5},
    {"city": "北京", "amount": 320.0},
    {"city": "深圳", "amount": 410.0},
    {"city": "广州", "amount": 45.0},
]

by_amount = rows
by_city_amt = rows

print(by_city_amt)`,
  check: `assert by_amount[0]['amount'] == 410.0, 'by_amount 第一个要是 410.0'
assert [r['amount'] for r in by_amount] == [410.0, 320.0, 120.5, 45.0], 'by_amount 要按金额降序'
keys = [(r['city'], -r['amount']) for r in by_city_amt]
assert keys == sorted(keys), 'by_city_amt 要城市升序、同城金额降序'
assert by_city_amt[0]['city'] == '北京', '城市升序时第一个应该是 北京'`,
  hint: 'key=lambda r: r["amount"], reverse=True；多列用 key=lambda r: (r["city"], -r["amount"])。',
  answer: `rows = [
    {"city": "深圳", "amount": 120.5},
    {"city": "北京", "amount": 320.0},
    {"city": "深圳", "amount": 410.0},
    {"city": "广州", "amount": 45.0},
]

by_amount = sorted(rows, key=lambda r: r["amount"], reverse=True)
by_city_amt = sorted(rows, key=lambda r: (r["city"], -r["amount"]))

print(by_city_amt)`
},
{
  id: 'b13', stage: 2, title: 'enumerate / zip：序号与并排',
  goal: 'ROW_NUMBER 和"两列并排"的 Python 写法',
  lesson: `- [[enumerate(列表, start=1)]] 同时拿到序号和值 ←→ [[ROW_NUMBER() OVER ()]]
- [[zip(a, b)]] 把两个序列按位置配成对 ←→ 两张表按位置对齐（注意：不是 JOIN，JOIN 是按 key 匹配）

~~~python
for i, row in enumerate(rows, start=1):
    print(i, row['order_id'])

for city, amount in zip(cities, amounts):
    print(city, amount)
~~~
> [[zip]] 只能按**位置**配，长度不一样会截断。要按字段匹配，得用 pandas 的 [[merge]]（第 43 关）。`,
  sql: `SELECT ROW_NUMBER() OVER (ORDER BY order_id) AS 序号, order_id
FROM orders
LIMIT 4;`,
  py: `rows = [{'order_id': 1001}, {'order_id': 1002}]
for i, r in enumerate(rows, start=1):
    print(i, r['order_id'])

cities = ['深圳', '北京']
amounts = [120.5, 320.0]
for c, a in zip(cities, amounts):
    print(c, a)`,
  note: 'ROW_NUMBER 的序号是 SQL 帮你造的；Python 里序号由 enumerate 造。zip 容易被误当成 JOIN，其实它不做任何匹配，只按顺序配。',
  task: `- [[ids = [1001, 1002, 1003]]] 用 [[enumerate]] 从 1 开始编号，逐个打印成 [[1 1001]] 这种格式（三行）
- 用 [[zip]] 把 [[cities]] 和 [[amounts]] 配成 [[pairs]]（list of tuple）
- 打印 [[pairs]]`,
  starter: `ids = [1001, 1002, 1003]
cities = ["深圳", "北京", "广州"]
amounts = [120.5, 320.0, 45.0]

for i in ids:
    print(i)

pairs = []

print(pairs)`,
  check: `assert len(_captured) >= 4, '要有 3 行编号输出 + 1 行 pairs'
assert _captured[0].strip() == '1 1001', '第一行要是 1 1001，现在是 %r' % _captured[0]
assert _captured[2].strip() == '3 1003', '第三行要是 3 1003'
assert pairs == [('深圳', 120.5), ('北京', 320.0), ('广州', 45.0)], 'pairs 要是 zip 出来的三对'`,
  hint: 'for i, oid in enumerate(ids, start=1): print(i, oid)；pairs = list(zip(cities, amounts))。',
  answer: `ids = [1001, 1002, 1003]
cities = ["深圳", "北京", "广州"]
amounts = [120.5, 320.0, 45.0]

for i, oid in enumerate(ids, start=1):
    print(i, oid)

pairs = list(zip(cities, amounts))
print(pairs)`
},

/* ============ 阶段三 · 控制流与函数 ============ */
{
  id: 'b14', stage: 3, title: 'if / elif / else：CASE WHEN 的写法',
  goal: '分支判断，注意缩进和冒号',
  lesson: `~~~python
if amount >= 200:
    level = 'high'
elif amount >= 100:
    level = 'mid'
else:
    level = 'low'
~~~
结构上和 [[CASE WHEN]] 一一对应：[[if → WHEN]]、[[elif → WHEN]]、[[else → ELSE]]、[[END]] 由缩进承担。

- 比较运算符：[[>]] [[>=]] [[<]] [[<=]] [[==]] [[!=]]
- 逻辑：[[and]] / [[or]] / [[not]]（SQL 是 AND/OR/NOT，写法相同但大小写不同）
- 空值判断：[[x is None]]

> 两个等号才是"等于"。写 [[if x = 1]] 直接语法错误。`,
  sql: `SELECT order_id, amount,
      CASE WHEN amount >= 200 THEN 'high'
           WHEN amount >= 100 THEN 'mid'
           ELSE 'low' END AS level
FROM orders
LIMIT 5;`,
  py: `for amount in [410.0, 120.5, 45.0, None]:
    if amount is None:
        level = 'unknown'
    elif amount >= 200:
        level = 'high'
    elif amount >= 100:
        level = 'mid'
    else:
        level = 'low'
    print(amount, level)`,
  note: 'SQL 的 CASE 遇到 NULL 会走 ELSE；Python 必须显式先写 [[if amount is None]]，否则 [[None >= 200]] 会抛 TypeError。这是"空值思维"的差别。',
  task: `写一个函数 [[grade(amount)]]：
- 金额为 [[None]] → 返回 [['unknown']]
- ≥ 200 → [['high']]
- ≥ 100 → [['mid']]
- 其余 → [['low']]

然后打印 [[grade(410.0)]]、[[grade(120.5)]]、[[grade(45.0)]]、[[grade(None)]]。`,
  starter: `def grade(amount):
    return "low"

print(grade(410.0))
print(grade(120.5))
print(grade(45.0))
print(grade(None))`,
  check: `assert grade(410.0) == 'high', '410 应该是 high'
assert grade(200.0) == 'high', '边界 200 应该是 high（用 >=）'
assert grade(120.5) == 'mid', '120.5 应该是 mid'
assert grade(45.0) == 'low', '45 应该是 low'
assert grade(None) == 'unknown', 'None 应该是 unknown（要先判断 is None）'`,
  hint: '函数体里按顺序写四个分支，第一句必须是 if amount is None。',
  answer: `def grade(amount):
    if amount is None:
        return "unknown"
    elif amount >= 200:
        return "high"
    elif amount >= 100:
        return "mid"
    else:
        return "low"

print(grade(410.0))
print(grade(120.5))
print(grade(45.0))
print(grade(None))`
},
{
  id: 'b15', stage: 3, title: 'for + range：逐行处理',
  goal: 'for 是"遍历一个可迭代对象"，不是 C 的计数器循环',
  lesson: `~~~python
for x in [1, 2, 3]:      # 直接遍历序列
    print(x)

for i in range(3):       # 0,1,2
    print(i)

for i in range(1, 4):     # 1,2,3
    print(i)
~~~
- [[range(n)]] → 0 到 n-1，**不含 n**
- [[range(1, 4)]] → 1,2,3
- 累加用"初始化 + 循环里 [[+=]]"

> 处理一批订单就是"遍历 list"，和游标的 [[while fetchone()]] 相比，Python 的 for 更省事：不用管取完没有。`,
  sql: `SELECT SUM(amount) AS 总额 FROM orders WHERE status = 'paid';`,
  py: `total = 0
for amount in [120.5, 88.0, 45.0]:
    total += amount
print(total)`,
  note: 'SQL 一个 SUM 就聚合完了；Python 需要"循环累加"。反过来，Python 能做的事（逐行调接口、逐行判断跳过）SQL 做不到——这就是 ETL 里为什么 SQL + Python 混用。',
  task: `用 for 循环计算 1 到 100（含 100）的和，存到 [[total]] 并打印；再用 [[range]] 打印 0 到 4 这五个数字。`,
  starter: `total = 0
for i in range(100):
    total += i

print(total)
for i in range(5):
    pass`,
  check: `assert total == 5050, 'total 应该是 1 到 100 的和 5050（注意 range 不含右端）'
assert len(_captured) >= 6, '要打印 total + 5 个数字'
assert [l.strip() for l in _captured[-5:]] == ['0', '1', '2', '3', '4'], '最后 5 行要是 0~4'`,
  hint: 'range(1, 101) 才是 1..100；打印数字要写 print(i) 而不是 pass。',
  answer: `total = 0
for i in range(1, 101):
    total += i

print(total)
for i in range(5):
    print(i)`
},
{
  id: 'b16', stage: 3, title: 'while：条件成立就一直转',
  goal: '重试、轮询、游标推进都靠它',
  lesson: `~~~python
n = 5
while n > 0:
    print(n)
    n -= 1
~~~
- 条件为真就继续，直到条件为假
- 别忘在循环体里改变量，否则死循环（页面会卡住）
- [[break]] 跳出、[[continue]] 跳过本次

> ETL 里的典型用途：分页拉接口，[[while has_more:]] 一直拉到没有下一页；或者写库失败重试 3 次。`,
  sql: `-- SQLite 用递归 CTE 模拟"循环"，Oracle 是 PL/SQL 的 LOOP
WITH RECURSIVE cnt(x) AS (
  SELECT 1
  UNION ALL SELECT x + 1 FROM cnt WHERE x < 4
)
SELECT x FROM cnt;`,
  py: `n = 5
while n > 0:
    print(n)
    n -= 1
print('done')`,
  note: 'SQL 的集合式写法天生不需要循环；真需要循环时（Oracle 的 PL/SQL、Hive 的脚本）非常笨重。Python 的 while 是"过程式"的强项。',
  task: `从 [[budget = 500]] 开始，每轮扣掉 120，用 while 循环：只要余额还 ≥ 0 就继续扣，统计扣了几次存到 [[rounds]]，最后打印 [[rounds]] 和剩余 [[budget]]（剩余应当为负数或 0，按你的循环条件决定）。`,
  starter: `budget = 500
rounds = 0

while budget > 0:
    break

print(rounds, budget)`,
  check: `assert rounds == 5, '应该扣 5 次（500 → 380 → 260 → 140 → 20 → -100）'
assert budget == -100, '最后余额应该是 -100'
assert _captured, '要 print 出来'`,
  hint: '循环体里写 budget -= 120 和 rounds += 1，别写 break。',
  answer: `budget = 500
rounds = 0

while budget > 0:
    budget -= 120
    rounds += 1

print(rounds, budget)`
},
{
  id: 'b17', stage: 3, title: 'def：定义函数',
  goal: '函数 = 可重复调用的小段逻辑，比 SQL 的存储过程轻得多',
  lesson: `~~~python
def calc_tax(amount, rate=0.06):
    """算出税额。文档字符串可有可无，但写了能用 help() 看到。"""
    return amount * rate

print(calc_tax(120.5))
~~~
- [[def 名字(参数):]] 定义，[[return]] 返回值
- 没写 [[return]] 就返回 [[None]]
- 参数可以有默认值（[[rate=0.06]]），调用时可不传

> 对照：SQL 的"函数"是数据库对象（Oracle 的 [[CREATE FUNCTION]]、PG 的 [[CREATE FUNCTION]]），要 DBA 建、要发布；Python 的函数写完就能用。`,
  sql: `SELECT 120.5 * 0.06 AS tax;`,
  py: `def calc_tax(amount, rate=0.06):
    return amount * rate

print(calc_tax(120.5))   # 7.23`,
  note: 'SQL 的存储过程/函数活在数据库里，Python 的函数活在脚本里。ETL 的清洗规则做成 Python 函数后，改一行就能全流程生效，不用改库。',
  task: `写两个函数：
- [[calc_tax(amount, rate=0.06)]] 返回税额
- [[net_amount(amount, rate=0.06)]] 返回税后金额（amount - 税额，保留两位）

打印 [[net_amount(120.5)]]，结果应为 [[113.27]]。`,
  starter: `def calc_tax(amount, rate=0.06):
    return 0

def net_amount(amount, rate=0.06):
    return amount

print(net_amount(120.5))`,
  check: `assert abs(calc_tax(100, 0.06) - 6.0) < 1e-6, 'calc_tax(100, 0.06) 应该是 6.0'
assert abs(calc_tax(120.5) - 7.23) < 1e-6, 'calc_tax(120.5) 应该用默认税率 0.06 = 7.23'
assert abs(net_amount(120.5) - 113.27) < 1e-6, 'net_amount(120.5) 应该是 113.27（保留两位）'`,
  hint: 'net_amount 里调用 calc_tax(amount, rate)，然后 round(amount - tax, 2)。',
  answer: `def calc_tax(amount, rate=0.06):
    return amount * rate

def net_amount(amount, rate=0.06):
    tax = calc_tax(amount, rate)
    return round(amount - tax, 2)

print(net_amount(120.5))`
},
{
  id: 'b18', stage: 3, title: '关键字参数：调用时写清楚参数名',
  goal: '参数一多，位置写错就是静默算错',
  lesson: `~~~python
def load(table, mode='append', batch=1000):
    ...

load('orders', mode='overwrite')
load('orders', batch=500, mode='append')
~~~
- 位置参数按顺序传，**关键字参数**写 [[名字=值]]，顺序随意
- 好处：[[load('orders', 500)]] 看不出 500 是什么；[[batch=500]] 一眼就懂
- 强制用关键字：参数列表里写 [[*, mode]]，调用时 mode 必须写名字

> 你自己写 ETL 函数时，超过两个参数就建议全用关键字，半年后回来改不会算错。`,
  sql: `-- SQL 的函数没有"关键字参数"，只能按位置传
SELECT ROUND(120.456, 2) AS r1,
       ROUND(120.456)    AS r2;`,
  py: `def load(table, mode='append', batch=1000):
    print(f'{table} mode={mode} batch={batch}')

load('orders', mode='overwrite')
load('orders', batch=500, mode='append')`,
  note: 'SQL 的 ROUND(值, 位数) 靠位置记，位数一多就得查手册；Python 允许 [[ROUND(值, 位数=2)]] 这样把语义写进调用处。',
  task: `补全函数 [[write_table(name, mode='append', batch=500)]]，让它返回一个字符串 [[f'{name} {mode} {batch}']]；然后：
- 用位置参数调用 [[write_table('orders')]] 存到 [[a]]
- 用关键字参数 [[mode='overwrite']] 调用存到 [[b]]
- 打印 [[a]] 和 [[b]]`,
  starter: `def write_table(name, mode="append", batch=500):
    return ""

a = write_table("orders")
b = write_table("orders")

print(a, b)`,
  check: `assert a == 'orders append 500', 'a 应该是 orders append 500'
assert b == 'orders overwrite 500', 'b 应该是 orders overwrite 500（用关键字参数）'
assert _captured, '要 print 出来'`,
  hint: "函数体 return f'{name} {mode} {batch}'；b 用 write_table('orders', mode='overwrite')。",
  answer: `def write_table(name, mode="append", batch=500):
    return f"{name} {mode} {batch}"

a = write_table("orders")
b = write_table("orders", mode="overwrite")

print(a, b)`
},
{
  id: 'b19', stage: 3, title: '*args / **kwargs：参数个数不定',
  goal: '封装日志、包装数据库调用时天天用',
  lesson: `~~~python
def log(*args, **kwargs):
    print('INFO', *args)

log('开始同步')                 # args = ('开始同步',)
log('同步', 'orders', 21)        # args = ('同步', 'orders', 21)
~~~
- [[*args]]：任意个位置参数，收成一个 **tuple**
- [[**kwargs]]：任意个关键字参数，收成一个 **dict**
- 调用时反过来用：[[f(*列表)]] 把列表拆成位置参数，[[f(**字典)]] 拆成关键字参数

> 对照 SQL：[[INSERT INTO t VALUES (?,?,?)]] 的参数个数是写死的；Python 的 *args 可以把"任意多行"一次塞进去。`,
  sql: `INSERT INTO users (user_id, name, city, vip) VALUES (6, '周敏', '杭州', 0);`,
  py: `def insert_row(*values):
    print('插入', len(values), '个字段：', values)

insert_row(6, '周敏', '杭州', 0)`,
  note: '批量写库时你会见到 [[cur.executemany(sql, rows)]]——每行是一个 tuple，字段数不定地拼进去，靠的就是"序列解包"这套机制。',
  task: `写函数 [[summary(*nums, **meta)]]：
- 打印 nums 的总和
- 打印 meta 里的键值对
调用 [[summary(1, 2, 3, city='深圳', status='paid')]]，最后再打印一行 [['ok']]。`,
  starter: `def summary(*nums, **meta):
    pass

summary(1, 2, 3, city="深圳", status="paid")`,
  check: `assert len(_captured) >= 3, '至少要有 3 行输出'
assert _captured[0].strip() == '6', '第一行要是总和 6'
assert 'city' in _captured[1] and '深圳' in _captured[1], '第二行要包含 city 和 深圳'
assert _captured[-1].strip() == 'ok', '最后一行要是 ok'`,
  hint: "函数里 print(sum(nums)) 和 print(meta)，最后在外面 print('ok')。",
  answer: `def summary(*nums, **meta):
    print(sum(nums))
    print(meta)

summary(1, 2, 3, city="深圳", status="paid")
print("ok")`
},
{
  id: 'b20', stage: 3, title: 'lambda：一次性的小函数',
  goal: '常配 sorted / map 使用，等价 ORDER BY 里的表达式',
  lesson: `[[lambda 参数: 表达式]] 就是"没有名字的 def"，只能写一个表达式：

~~~python
double = lambda x: x * 2       # 等价 def double(x): return x * 2
sorted(rows, key=lambda r: r['amount'])
~~~

> 只在"传进去用一次"的场合用 lambda；稍微复杂就该老实写 [[def]]，否则可读性很差。`,
  sql: `-- ORDER BY 后面可以直接跟表达式，等价于给 sorted 传 key
SELECT order_id, amount * 1.1 AS x
FROM orders
ORDER BY amount * 1.1 DESC
LIMIT 3;`,
  py: `rows = [{'amount': 120.5}, {'amount': 410.0}, {'amount': 45.0}]
print(sorted(rows, key=lambda r: r['amount'], reverse=True))`,
  note: 'SQL 能直接对表达式排序（ORDER BY amount*1.1）；Python 要先造一个"取排序值"的函数，也就是 key。',
  task: `已有 [[rows]]（dict 列表，含 [[city]] 和 [[amount]]）：
- [[taxed]] = 用 [[map]] + lambda 给每条加上 [[tax]] 字段（金额 × 1.06，保留 2 位）
- [[sorted_rows]] = 按 [[tax]] 降序
- 打印 [[sorted_rows]]`,
  starter: `rows = [
    {"city": "深圳", "amount": 120.5},
    {"city": "北京", "amount": 320.0},
    {"city": "广州", "amount": 45.0},
]

taxed = rows
sorted_rows = rows

print(sorted_rows)`,
  check: `assert all('tax' in r for r in taxed), '每条记录都要有 tax 字段'
assert abs(taxed[0]['tax'] - 127.73) < 1e-6, '120.5 * 1.06 = 127.73'
assert [round(r['tax'], 2) for r in sorted_rows] == [339.2, 127.73, 47.7], 'sorted_rows 要按 tax 降序：339.2 / 127.73 / 47.7'`,
  hint: "lambda r: {**r, 'tax': round(r['amount'] * 1.06, 2)} 配合 map，外面套 list()。",
  answer: `rows = [
    {"city": "深圳", "amount": 120.5},
    {"city": "北京", "amount": 320.0},
    {"city": "广州", "amount": 45.0},
]

taxed = list(map(lambda r: {**r, "tax": round(r["amount"] * 1.06, 2)}, rows))
sorted_rows = sorted(taxed, key=lambda r: r["tax"], reverse=True)

print(sorted_rows)`
},
{
  id: 'b21', stage: 3, title: '作用域：函数里能不能改外面的变量',
  goal: 'global / nonlocal，以及为什么"别用全局变量"',
  lesson: `函数内部赋值 = **新建局部变量**，不会改外面的：

~~~python
total = 0
def add(x):
    total = total + x   # ← 这样写会报 UnboundLocalError
~~~
要改全局必须声明 [[global total]]。更推荐的做法：**用参数进、用返回值出**。

~~~python
def add(total, x):
    return total + x
~~~
> ETL 脚本里经典事故：写库函数里改了全局 [[conn]]，外部还用着旧连接。用返回值最稳。`,
  sql: `-- SQL 没有"函数作用域"这回事，变量就是会话级/包级的
SELECT @total := @total + amount FROM orders LIMIT 3;  -- MySQL 的老写法，不推荐
-- 正解是一个 SUM 聚合：SELECT SUM(amount) FROM orders;`,
  py: `total = 0

def add_bad(x):
    total += x      # 报错：UnboundLocalError

def add_ok(total, x):
    return total + x

total = add_ok(total, 10)
print(total)`,
  note: 'SQL 的聚合天然是"输入 → 输出"，没有可变全局状态；Python 允许副作用，所以更要自律。',
  task: `写函数 [[apply_batch(total, rows, rate=0.06)]]，返回扣完税后的总额（每行 [[amount]] 都乘 (1 - rate)）；调用 [[apply_batch(0, [120.5, 88.0])]] 存到 [[result]]，结果应为 [[195.99]]（保留两位）。`,
  starter: `total = 0

def apply_batch(total, rows, rate=0.06):
    for amount in rows:
        total += amount
    return total

result = apply_batch(total, [120.5, 88.0])
print(result)`,
  check: `assert abs(result - 195.99) < 1e-6, 'result 应该是 195.99（120.5*0.94 + 88*0.94，保留两位）'`,
  hint: '每行算 amount * (1 - rate)，累加后 round(…, 2)。',
  answer: `total = 0

def apply_batch(total, rows, rate=0.06):
    for amount in rows:
        total += amount * (1 - rate)
    return round(total, 2)

result = apply_batch(total, [120.5, 88.0])
print(result)`
},

/* ============ 阶段四 · 模块 / 文件 / 异常 ============ */
{
  id: 'b22', stage: 4, title: 'import：调用标准库',
  goal: 'import 就是"把已经在的标准库接过来用"',
  lesson: `~~~python
import math
from datetime import datetime, timedelta

print(math.sqrt(16))          # 4.0
print(math.floor(3.7))        # 3  ← 等价 SQL 的 FLOOR
print(datetime.now())         # 当前时间
~~~
- [[import 模块]] 之后用 [[模块.函数()]]
- [[from 模块 import 名字]] 直接叫名字
- 别名：[[import pandas as pd]]（后面全用 pd）

> [[math]] 里常用的：[[sqrt]]、[[floor]]、[[ceil]]、[[abs]] 其实是内置的、[[round]] 也是内置的。`,
  sql: `SELECT FLOOR(3.7) AS f, ROUND(SQRT(16), 2) AS s;`,
  py: `import math
from datetime import datetime

print(math.floor(3.7))
print(math.sqrt(16))
print(datetime.now().date())`,
  note: 'SQL 的内置函数由数据库提供；Python 的内置函数由"标准库"提供——不用装，import 就能用。',
  task: `用 [[math]] 算出：
- [[floor3]] = [[math.floor(3.7)]]
- [[sqrt16]] = [[math.sqrt(16)]]
- [[pow2]] = [[math.pow(2, 10)]]
打印这三个值。`,
  starter: `import math

floor3 = 3.7
sqrt16 = 16
pow2 = 0

print(floor3, sqrt16, pow2)`,
  check: `assert floor3 == 3, 'floor3 应该是 3'
assert abs(sqrt16 - 4.0) < 1e-9, 'sqrt16 应该是 4.0'
assert abs(pow2 - 1024) < 1e-9, 'pow2 应该是 1024'
assert _captured, '要 print 出来'`,
  hint: 'math.floor(3.7)、math.sqrt(16)、math.pow(2, 10)。',
  answer: `import math

floor3 = math.floor(3.7)
sqrt16 = math.sqrt(16)
pow2 = math.pow(2, 10)

print(floor3, sqrt16, pow2)`
},
{
  id: 'b23', stage: 4, title: '文件读写：with open',
  goal: '文件是 ETL 的入口和出口，with 帮你自动关文件',
  lesson: `~~~python
with open('/home/pyodide/sample.txt', 'w', encoding='utf-8') as f:
    f.write('第一行\\n第二行\\n')

with open('/home/pyodide/sample.txt', encoding='utf-8') as f:
    print(f.read())
~~~
- 模式：[[r]] 读、[[w]] 覆盖写、[[a]] 追加
- [[with]] 会在块结束自动关闭文件（不写 with 就得 [[f.close()]]，忘了会占句柄）
- 中文一定写 [[encoding='utf-8']]，Windows 默认 GBK 会乱码

> 对照 SQL：[[LOAD DATA INFILE]] / Oracle 的 [[UTL_FILE]] 都是从文件进库；区别是 Python 的文件操作不用任何权限配置。`,
  sql: `-- SQL 侧从文件进库的典型写法（SQLite 用 .import，MySQL 用 LOAD DATA）
SELECT COUNT(*) AS rows_in_orders FROM orders;`,
  py: `with open('/home/pyodide/sample.txt', 'w', encoding='utf-8') as f:
    f.write('深圳 120.5\\n北京 320.0\\n')

with open('/home/pyodide/sample.txt', encoding='utf-8') as f:
    lines = f.read().splitlines()
print(lines)`,
  note: '这里没有 SQL 等价写法，SQL 的 LOAD DATA 要服务器权限；Python 就是在文件系统上读写，沙箱里随便造。',
  task: `往 [[/home/pyodide/sample.txt]] 写入两行：[[深圳 120.5]] 和 [[北京 320.0]]（用 [[with open(..., 'w', encoding='utf-8')]]）；再读回来拆成行存到 [[lines]] 并打印。`,
  starter: `with open("/home/pyodide/sample.txt", "w", encoding="utf-8") as f:
    f.write("")

with open("/home/pyodide/sample.txt", encoding="utf-8") as f:
    lines = []

print(lines)`,
  check: `assert lines == ['深圳 120.5', '北京 320.0'], "lines 应该是 ['深圳 120.5', '北京 320.0']，用 splitlines()"
assert _captured, '要 print 出来'`,
  hint: '写入时 f.write("深圳 120.5\\n北京 320.0\\n")；读取时 f.read().splitlines()。',
  answer: `with open("/home/pyodide/sample.txt", "w", encoding="utf-8") as f:
    f.write("深圳 120.5\\n北京 320.0\\n")

with open("/home/pyodide/sample.txt", encoding="utf-8") as f:
    lines = f.read().splitlines()

print(lines)`
},
{
  id: 'b24', stage: 4, title: 'csv 模块：把表读成 dict',
  goal: 'csv.DictReader 就是"文件版 SELECT"',
  lesson: `~~~python
import csv
with open('/home/pyodide/orders.csv', encoding='utf-8') as f:
    rows = list(csv.DictReader(f))
print(rows[0]['city'])
~~~
- [[csv.DictReader]] 把第一行当表头，每行给你一个 dict（值全是字符串！）
- [[csv.writer]] / [[DictWriter]] 用来写
- 数值要自己 [[float()]] 转，这是 ETL 第一课

> 对照：这就是 SQL 里 [[SELECT * FROM orders]] 的"文件读法"，只是所有列都是 VARCHAR。`,
  sql: `SELECT COUNT(*) AS n, COUNT(DISTINCT city) AS cities FROM orders;`,
  py: `import csv

with open('/home/pyodide/orders.csv', encoding='utf-8') as f:
    rows = list(csv.DictReader(f))

print(len(rows), len({r['city'] for r in rows}))`,
  note: 'SQL 里表已经建好、类型已经定好；CSV 里没有类型，读完还得自己转——所以后面 pandas 的 read_csv 会帮你猜类型。',
  task: `读 [[/home/pyodide/orders.csv]]，统计：
- [[n]] = 行数（应为 21）
- [[cities]] = 城市去重个数（应为 4）
- [[paid_total]] = [[status == 'paid']] 的金额总和，注意 [[amount]] 是字符串、有空值，要转 float 并跳过空
打印这三个值。`,
  starter: `import csv

with open("/home/pyodide/orders.csv", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

n = 0
cities = 0
paid_total = 0

print(n, cities, paid_total)`,
  check: `assert n == 21, 'n 应该是 21'
assert cities == 4, 'cities 应该是 4'
assert abs(paid_total - 1846.9) < 1e-6, 'paid_total 应该是 1846.9（空 amount 要跳过）'`,
  hint: "n = len(rows)；cities = len({r['city'] for r in rows})；paid_total 用循环：if r['status']=='paid' and r['amount']: paid_total += float(r['amount'])。",
  answer: `import csv

with open("/home/pyodide/orders.csv", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

n = len(rows)
cities = len({r["city"] for r in rows})
paid_total = 0
for r in rows:
    if r["status"] == "paid" and r["amount"]:
        paid_total += float(r["amount"])

print(n, cities, paid_total)`
},
{
  id: 'b25', stage: 4, title: 'json 模块：接口数据的第一步',
  goal: 'json.loads / json.dumps，调 API 必会',
  lesson: `~~~python
import json
data = json.loads('{"order_id": 1001, "city": "深圳"}')   # 字符串 → dict
s = json.dumps({'a': 1}, ensure_ascii=False)              # dict → 字符串
~~~
- [[loads]] 解析字符串、[[load]] 读文件
- [[dumps]] 转字符串、[[dump]] 写文件
- [[ensure_ascii=False]] 才能保住中文（否则变成 \\u6df1\\u5733）
- 嵌套结构照样解析成 dict / list 套娃

> 对照：SQL 的 JSON 函数（Oracle 的 [[JSON_VALUE]]、PG 的 [[->>]]、MySQL 的 [[JSON_EXTRACT]]）是在库里解 JSON；Python 是拿到手先解成 dict。`,
  sql: `SELECT json_extract('{"order_id": 1001, "city": "深圳"}', '$.city') AS city;`,
  py: `import json

raw = '{"order_id": 1001, "city": "深圳"}'
data = json.loads(raw)
print(data['city'])
print(json.dumps(data, ensure_ascii=False))`,
  note: '接口返回的 JSON 常常是 list[dict]，这就是"一张表的 JSON 形态"，pandas 可以用 pd.json_normalize 直接摊平成 DataFrame。',
  task: `解析 [[raw = '{"order_id": 1001, "city": "深圳", "amount": "120.50"}']]：
- [[data]] = 解析后的 dict
- [[amount]] = 把其中的 amount 转成 float（120.5）
- [[back]] = 把 data 重新 dump 成字符串（[[ensure_ascii=False]]）
打印 [[amount]] 和 [[back]]`,
  starter: `import json

raw = '{"order_id": 1001, "city": "深圳", "amount": "120.50"}'

data = {}
amount = 0
back = ""

print(amount, back)`,
  check: `assert data.get('city') == '深圳', 'data 要是解析出来的 dict'
assert abs(amount - 120.5) < 1e-9, 'amount 要转成 float 120.5'
assert '深圳' in back and back.startswith('{'), 'back 要是含中文的 JSON 字符串（用 ensure_ascii=False）'`,
  hint: "data = json.loads(raw)；amount = float(data['amount'])；back = json.dumps(data, ensure_ascii=False)。",
  answer: `import json

raw = '{"order_id": 1001, "city": "深圳", "amount": "120.50"}'

data = json.loads(raw)
amount = float(data["amount"])
back = json.dumps(data, ensure_ascii=False)

print(amount, back)`
},
{
  id: 'b26', stage: 4, title: 'try / except：出错了怎么办',
  goal: 'ETL 里"一条坏数据不能炸整个任务"',
  lesson: `~~~python
try:
    amount = float('abc')
except ValueError as e:
    print('转换失败：', e)
finally:
    print('这一句一定执行')
~~~
- [[try]] 里放可能出错的代码
- [[except 异常类型]] 接住，可以接多种：[[except (ValueError, TypeError)]]
- [[else]] 没出错时执行、[[finally]] 无论如何都执行（关连接放这里）
- 想全接住用 [[except Exception]]，但要**明确知道自己在忽略什么**

> 对照事务：SQL 出错要么整条回滚要么报错给你；Python 默认是"出错就中断"，要不要吞掉必须你自己决定。`,
  sql: `-- Oracle 才抛除零错：ORA-01476；SQLite / MySQL 返回 NULL
SELECT 1 / 0 AS x;`,
  py: `for v in ['120.50', '', 'abc']:
    try:
        print(float(v))
    except ValueError:
        print('跳过坏值', repr(v))`,
  note: '这条 SQL 在 SQLite 里不报错（返回 NULL），Oracle 里会抛 ORA-01476。同样的语句不同库不同脾气——这正是 Python 侧要统一兜住异常的原因。',
  task: `给定 [[values = ['120.50', '', 'abc', '88.0']]]，用 try/except 逐个转 float：
- 成功的累加进 [[total]]
- 失败的把值追加进 [[bad]]
最后打印 [[total]]（应为 208.5）和 [[bad]]（应为 [[['', 'abc']]]）`,
  starter: `values = ["120.50", "", "abc", "88.0"]

total = 0
bad = []

print(total, bad)`,
  check: `assert abs(total - 208.5) < 1e-9, 'total 应该是 208.5（120.5 + 88.0）'
assert bad == ['', 'abc'], "bad 应该是 ['', 'abc']"
assert _captured, '要 print 出来'`,
  hint: "循环里 try: total += float(v) / except ValueError: bad.append(v)。空字符串也会抛 ValueError。",
  answer: `values = ["120.50", "", "abc", "88.0"]

total = 0
bad = []
for v in values:
    try:
        total += float(v)
    except ValueError:
        bad.append(v)

print(total, bad)`
},
{
  id: 'b27', stage: 4, title: 'raise：主动抛异常',
  goal: '数据校验失败要炸得早、炸得清楚',
  lesson: `~~~python
def check_amount(amount):
    if amount is None:
        raise ValueError('amount 不能为空')
    if amount < 0:
        raise ValueError(f'金额不能为负：{amount}')
    return amount
~~~
- [[raise 异常类型('说明')]] 主动抛
- 自定义异常：[[class DataQualityError(Exception): pass]]，再 [[raise DataQualityError(...)]]
- 抛得早比"悄悄改正"安全：脏数据留到下游就是事故

> 对照 Oracle 的 [[RAISE_APPLICATION_ERROR(-20001, '...')]]：数据库侧主动报业务错误，Python 侧一个 [[raise]] 就等价。`,
  sql: `-- Oracle 里：RAISE_APPLICATION_ERROR(-20001, '金额不能为负');
SELECT order_id, amount FROM orders WHERE amount < 0;  -- 当前没有负金额`,
  py: `class DataQualityError(Exception):
    pass

def check_amount(amount):
    if amount is None:
        raise ValueError('amount 不能为空')
    if amount < 0:
        raise ValueError(f'金额不能为负：{amount}')
    return amount

print(check_amount(120.5))`,
  note: '把 [[raise]] 放在"写库之前"，脏数据就进不了目标表；这是 ETL 里最划算的一道闸。',
  task: `定义 [[class DataQualityError(Exception)]]，写函数 [[validate(row)]]：
- [[amount]] 为 [[None]] → 抛 [[DataQualityError]]
- [[amount]] < 0 → 抛 [[DataQualityError]]
- 正常 → 返回 [[row]]

然后：先用 [[validate({'amount': -5})]] 触发异常并 [[except]] 打印 [['负金额被拦截']]，再打印 [[validate({'amount': 120.5})['amount']]]。`,
  starter: `class DataQualityError(Exception):
    pass

def validate(row):
    return row

print(validate({"amount": 120.5}))`,
  check: `assert issubclass(DataQualityError, Exception), '要定义 DataQualityError 异常类'
assert _captured and _captured[0].strip() == '负金额被拦截', '第一行要打印 负金额被拦截'
assert '120.5' in _captured[-1], '最后一行要打印 120.5'
try:
    validate({'amount': None})
except DataQualityError:
    pass
else:
    raise AssertionError('None 也应该抛 DataQualityError')`,
  hint: "validate 里先判 None 再判 < 0，都 raise DataQualityError('...')；外面用 try/except 包住 validate({'amount': -5})。",
  answer: `class DataQualityError(Exception):
    pass

def validate(row):
    if row.get("amount") is None:
        raise DataQualityError("amount 不能为空")
    if row["amount"] < 0:
        raise DataQualityError("金额不能为负")
    return row

try:
    validate({"amount": -5})
except DataQualityError:
    print("负金额被拦截")

print(validate({"amount": 120.5})["amount"])`
}
];
