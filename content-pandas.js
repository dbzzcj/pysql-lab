/* PySQL Lab · 关卡内容（三）：阶段七 ~ 阶段九（第 37–55 关）
   这一段的 SQL 和 pandas 都跑同一份数据，可以左右对照着看结果。 */

window.LEVELS = window.LEVELS.concat([
/* ============ 阶段七 · SQL → pandas ============ */
{
  id: 'p37', stage: 7, title: 'read_csv：一张表 = 一个 DataFrame',
  goal: '认识 pandas 的基本对象，把 CSV 变成"内存里的表"',
  lesson: `[[pd.read_csv(路径)]] 把文件读成 [[DataFrame]]（二维表）。它就是你以后天天面对的东西：

- [[df.shape]] → [[(行数, 列数)]]，等价 [[SELECT COUNT(*), 列数]]
- [[df.columns]] 列名列表
- [[df.dtypes]] 每列类型（amount 会被识别成 [[float64]]，空值是 [[NaN]]）
- [[df.head(5)]] 看前 5 行，等价 [[LIMIT 5]]
- [[df.info()]] 一次性看行数、类型、非空数量

> 重点：pandas 的类型是**推断**出来的，不像 DDL 那样由你声明。amount 里有两个空格子，读进来就是 NaN——这就是后面"缺失值"那一关的来源。`,
  sql: `SELECT * FROM orders LIMIT 5;`,
  py: `import pandas as pd

df = pd.read_csv('/home/pyodide/orders.csv')
print(df.shape)
print(df.columns.tolist())
print(df.head(3))`,
  note: 'SQL 的表结构由 DDL 固定；CSV 没有 DDL，pandas 只能推断：order_id 是 int64、amount 是 float64（因为有 NaN）、city 是 object（字符串）。',
  task: `读 [[/home/pyodide/orders.csv]] 到 [[df]]，然后：
- 打印 [[df.shape]]（应为 [[(21, 6)]]）
- 打印列名列表 [[df.columns.tolist()]]
- 打印 [[df.head()]]`,
  starter: `import pandas as pd

df = pd.read_csv("/home/pyodide/orders.csv")
print(df.shape)`,
  check: `import pandas as pd
assert isinstance(df, pd.DataFrame), 'df 要是 DataFrame'
assert df.shape == (21, 6), 'shape 应该是 (21, 6)，现在是 %r' % (df.shape,)
assert df.columns.tolist() == ['order_id', 'user_id', 'city', 'amount', 'status', 'created_at'], '列名不对'
assert str(df['amount'].dtype) == 'float64', "amount 应该是 float64（因为有 NaN）"
assert len(_captured) >= 2, 'shape 和列名都要打印'`,
  hint: '三件事各写一个 print：df.shape、df.columns.tolist()、df.head()。',
  answer: `import pandas as pd

df = pd.read_csv("/home/pyodide/orders.csv")
print(df.shape)
print(df.columns.tolist())
print(df.head())`
},
{
  id: 'p38', stage: 7, title: '选择列 / 筛选行：SELECT … WHERE',
  goal: '两种最基本的操作，先把 SQL 的骨架搬过来',
  lesson: `~~~python
df[['order_id', 'amount']]                       # 选列（注意双层方括号）
df[df['status'] == 'paid']                       # 筛行
df[(df['status'] == 'paid') & (df['amount'] > 100)]   # 多条件：& | ~
df[df['city'].isin(['深圳', '广州'])]              # IN
df[~df['city'].isin(['深圳'])]                    # NOT IN
~~~
- 选**一列**是 Series：[[df['amount']]]；选**多列**要 [[df[['a','b']]]]（多一层括号）
- 多条件必须用 [[&]] [[|]] [[~]]，**不能用 and/or/not**，并且每个条件都要单独加括号
- [[isin()]] 等价 [[IN]]，[[between(a, b)]] 等价 [[BETWEEN]]，
- 字符串匹配：[[df['city'].str.startswith('深')]] 等价 [[LIKE '深%']]

> 90% 的人第一次踩的坑：[[df['status']=='paid' and df['amount']>100]] 直接报错。记住用 [[&]]。`,
  sql: `SELECT order_id, amount
FROM orders
WHERE status = 'paid' AND amount > 100;`,
  py: `cols = df[['order_id', 'amount']]
paid_big = df[(df['status'] == 'paid') & (df['amount'] > 100)]`,
  note: '筛选结果和 SQL 的 WHERE 一样是"新表"，原 df 不变。想改原表得显式赋值回去，或者用 .loc 直接改。',
  task: `- [[cols]] = 只取 [[order_id]] 和 [[amount]] 两列
- [[paid_big]] = [[status == 'paid']] 且 [[amount > 100]] 的行（应为 6 行）
- 打印 [[paid_big.shape]] 和 [[paid_big['order_id'].tolist()]]`,
  starter: `cols = df
paid_big = df

print(paid_big.shape)`,
  check: `assert cols.columns.tolist() == ['order_id', 'amount'], 'cols 要只有两列'
assert paid_big.shape[0] == 6, 'paid_big 应该是 6 行，现在是 %r' % (paid_big.shape,)
assert paid_big['order_id'].tolist() == [1001, 1005, 1007, 1011, 1014, 1017], '筛选出来的订单号不对'`,
  hint: "cols = df[['order_id','amount']]；paid_big = df[(df['status']=='paid') & (df['amount']>100)]。括号一个都不能少。",
  answer: `cols = df[["order_id", "amount"]]
paid_big = df[(df["status"] == "paid") & (df["amount"] > 100)]

print(paid_big.shape)
print(paid_big["order_id"].tolist())`
},
{
  id: 'p39', stage: 7, title: 'loc 与 iloc：按名字取 vs 按位置取',
  goal: '这两兄弟是 pandas 里最容易混的，记住一句话就够',
  lesson: `- [[df.loc[行标签, 列名]]] —— **按名字**（标签）
- [[df.iloc[行号, 列号]]] —— **按位置**（整数下标）

~~~python
df.iloc[0]                 # 第 1 行（位置 0）
df.iloc[:3, 0:2]           # 前 3 行的前 2 列
df.loc[df['status']=='paid', ['order_id', 'city']]   # 条件 + 指定列
~~~
- [[df.loc[0]]] 能不能用，取决于索引标签是不是 0；默认索引就是 0..n-1，所以看起来一样，但 [[sort_values]] / [[dropna]] 之后索引会变
- 想安全地把索引重置成 0..n-1：[[df.reset_index(drop=True)]]
- [[LIMIT 3 OFFSET 2]] 对应 [[df.iloc[2:5]]]

> 一句话：**名字用 loc，位置用 iloc**。拿到别人写的脚本里 loc 报 KeyError，八成是索引没 reset。`,
  sql: `SELECT order_id, city FROM orders WHERE status = 'paid' LIMIT 5;`,
  py: `first = df.iloc[0]
first3 = df['order_id'].iloc[:3].tolist()
paid_cols = df.loc[df['status'] == 'paid', ['order_id', 'city']]`,
  note: 'SQL 没有"索引"概念，行号只是显示用；pandas 的索引是会跟着排序、筛选走的，所以按位置取一定用 iloc。',
  task: `- [[first_row]] = 用 [[iloc]] 取第 1 行（Series）
- [[first3_ids]] = 前 3 个 [[order_id]] 的 list（应为 [[[1001, 1002, 1003]]]）
- [[paid_cols]] = 已付订单的 [[order_id]] 和 [[city]] 两列（14 行）
打印 [[first3_ids]] 和 [[paid_cols.shape]]`,
  starter: `first_row = None
first3_ids = []
paid_cols = df

print(first3_ids, paid_cols.shape)`,
  check: `assert first_row is not None and first_row['order_id'] == 1001, 'first_row 要是第 1 行的 Series'
assert first3_ids == [1001, 1002, 1003], 'first3_ids 不对'
assert paid_cols.shape == (14, 2), 'paid_cols 应该是 14 行 2 列'`,
  hint: "df.iloc[0]；df['order_id'].iloc[:3].tolist()；df.loc[df['status']=='paid', ['order_id','city']]。",
  answer: `first_row = df.iloc[0]
first3_ids = df["order_id"].iloc[:3].tolist()
paid_cols = df.loc[df["status"] == "paid", ["order_id", "city"]]

print(first3_ids)
print(paid_cols.shape)`
},
{
  id: 'p40', stage: 7, title: 'sort_values：ORDER BY',
  goal: '单列排序、多列排序、升降序混合，以及 NaN 放哪',
  lesson: `~~~python
df.sort_values('amount', ascending=False)                     # ORDER BY amount DESC
df.sort_values(['city', 'amount'], ascending=[True, False])    # ORDER BY city, amount DESC
df.sort_values('amount', na_position='first')                  # NULL 放最前
~~~
- [[ascending]] 可以是列表，和 [[by]] 一一对应
- 默认 [[na_position='last']]，即 NaN 永远在最后（不管升降序）
- 排序**不修改原表**，要落回去得 [[df = df.sort_values(...)]]

> 对照：SQL 的 NULL 排序行为各库不同（Oracle 默认 NULL 最大、PG 默认 NULL 最大、MySQL NULL 最小）；pandas 统一放最后，反而更好预测。`,
  sql: `SELECT city, amount
FROM orders
ORDER BY city ASC, amount DESC;`,
  py: `by_amt = df.sort_values('amount', ascending=False)
by_city = df.sort_values(['city', 'amount'], ascending=[True, False])`,
  note: 'SQL 用 ORDER BY 字段名；pandas 用列名列表 + ascending 列表。多列混排时，两边逻辑一致：先按第一列，相同再按第二列。',
  task: `- [[by_amt]] = 按 [[amount]] 降序
- [[by_city]] = 先按 [[city]] 升序，同城市按 [[amount]] 降序
打印 [[by_amt['amount'].head(3).tolist()]]（应为 [[[410.0, 320.0, 210.0]]]）`,
  starter: `by_amt = df
by_city = df

print(by_amt['amount'].head(3).tolist())`,
  check: `assert by_amt['amount'].head(3).tolist() == [410.0, 320.0, 210.0], 'by_amt 前三个金额不对'
assert by_city.iloc[0]['city'] == '上海', 'by_city 第一行城市应该是 上海（城市按字典序升序）'
keys = list(zip(by_city['city'], -by_city['amount'].fillna(-1e9)))
assert keys == sorted(keys), 'by_city 要城市升序、同城金额降序'`,
  hint: "sort_values('amount', ascending=False)；多列用 by=['city','amount'], ascending=[True,False]。",
  answer: `by_amt = df.sort_values("amount", ascending=False)
by_city = df.sort_values(["city", "amount"], ascending=[True, False])

print(by_amt["amount"].head(3).tolist())`
},
{
  id: 'p41', stage: 7, title: '聚合：SUM / AVG / COUNT 一次算完',
  goal: '把 SQL 的聚合函数换成 Series 上的方法',
  lesson: `~~~python
df['amount'].sum()      # SUM      注意：自动跳过 NaN
df['amount'].mean()     # AVG
df['amount'].count()    # COUNT(amount)  非空个数
df['amount'].size       # 总行数（= COUNT(*)）
df['amount'].max()      # MAX
df['amount'].describe() # 一次给出 count/mean/std/min/25%/50%/75%/max
df.agg({'amount': ['sum', 'mean', 'count']})
~~~
> 最关键的差异：[[count()]] 只数**非空**值，[[size]] 才是行数。SQL 的 [[COUNT(*)]] 对应 [[size]]，[[COUNT(amount)]] 对应 [[count()]]——这一步错，报表全错。`,
  sql: `SELECT SUM(amount) AS 总额,
       COUNT(amount) AS 非空笔数,
       COUNT(*)      AS 总行数,
       MAX(amount)   AS 最大值
FROM orders;`,
  py: `total = df['amount'].sum()      # 2350.7
nonnull = df['amount'].count()   # 19
rows = df['amount'].size          # 21
print(total, nonnull, rows)`,
  note: 'pandas 的 sum/mean 默认 skipna=True（跳过空值），SQL 的 SUM/AVG 也是忽略 NULL 的（COUNT(*) 除外）。两边语义一致，但 count 和 size 的区别必须记住。',
  task: `算出并打印：
- [[total]] = 全部金额和（[[2350.7]]）
- [[nonnull]] = 金额非空个数（[[19]]）
- [[rows]] = 总行数（[[21]]）
- [[avg]] = 金额平均（保留两位，[[123.72]]）
- [[paid_total]] = 仅 [[paid]] 的金额和（[[1846.9]]）`,
  starter: `total = 0
nonnull = 0
rows = 0
avg = 0
paid_total = 0

print(total, nonnull, rows, avg, paid_total)`,
  check: `assert abs(total - 2350.7) < 1e-6, 'total 应该是 2350.7'
assert nonnull == 19, 'nonnull 应该是 19（用 count()）'
assert rows == 21, 'rows 应该是 21（用 size）'
assert abs(avg - 123.72) < 0.01, 'avg 应该是 123.72'
assert abs(paid_total - 1846.9) < 1e-6, 'paid_total 应该是 1846.9'`,
  hint: "df['amount'].sum() / .count() / .size / round(.mean(), 2)；paid_total 用 df.loc[df['status']=='paid','amount'].sum()。",
  answer: `total = df["amount"].sum()
nonnull = df["amount"].count()
rows = df["amount"].size
avg = round(df["amount"].mean(), 2)
paid_total = df.loc[df["status"] == "paid", "amount"].sum()

print(total, nonnull, rows, avg, paid_total)`
},
{
  id: 'p42', stage: 7, title: 'groupby：GROUP BY（含 HAVING）',
  goal: '分组聚合，报表的核心动作',
  lesson: `~~~python
df.groupby('city')['amount'].sum()                       # 每个城市金额和
df.groupby('city').agg(n=('order_id', 'size'), amt=('amount', 'sum'))   # 多个指标 + 改名
df.groupby('city')['amount'].count()                     # 非空个数（≠ size）
df.groupby('city').filter(lambda g: len(g) > 3)          # 类似 HAVING
~~~
- [[groupby(列)]] 之后必须接聚合（[[sum]] / [[agg]] / [[size]]），否则只是个分组对象
- [[agg(新名=('列', '函数'))]] 是命名聚合，直接改列名，比事后 [[rename]] 干净
- [[size()]] 和 [[count()]] 在分组里差别最大：[[size()]] 含 NaN 行，[[count()]] 不含
- 分组结果是**以分组键为索引**的，想变回普通列用 [[.reset_index()]]

> HAVING 的等价写法是 [[filter]]，或者聚合完再筛：[[g[g['n'] > 3]]]。`,
  sql: `SELECT city,
       COUNT(*)        AS n,
       COUNT(amount)   AS n_amount,
       SUM(amount)     AS amt
FROM orders
GROUP BY city;`,
  py: `g = df.groupby('city').agg(
    n=('order_id', 'size'),
    n_amount=('amount', 'count'),
    amt=('amount', 'sum')
)
print(g)`,
  note: 'SQL 的 GROUP BY 输出就是一张表；pandas 输出把 city 变成了索引。[[reset_index()]] 之后两边长得一模一样，可以直接对比。',
  task: `按 [[city]] 分组，得到 [[g]]，包含三列：
- [[n]] = 订单行数（[[size]]）
- [[n_amount]] = 金额非空个数（[[count]]）
- [[amt]] = 金额和
打印 [[g]]

数据核对：深圳 [[n=10 / n_amount=9 / amt=1255.5]]，广州 [[4 / 4 / 265.7]]，上海 [[4 / 3 / 312.7]]，北京 [[3 / 3 / 516.8]]。`,
  starter: `g = df.groupby('city').size()
print(g)`,
  check: `assert hasattr(g, 'columns') and set(['n', 'n_amount', 'amt']) <= set(g.columns), 'g 要包含 n / n_amount / amt 三列'
assert g.loc['深圳', 'n'] == 10 and g.loc['深圳', 'n_amount'] == 9, '深圳应该是 10 行、9 个非空金额'
assert abs(g.loc['深圳', 'amt'] - 1255.5) < 1e-6, '深圳金额和应该是 1255.5'
assert abs(g.loc['北京', 'amt'] - 516.8) < 1e-6, '北京金额和应该是 516.8'
assert len(g) == 4, '应该有 4 个城市'`,
  hint: "g = df.groupby('city').agg(n=('order_id','size'), n_amount=('amount','count'), amt=('amount','sum'))。",
  answer: `g = df.groupby("city").agg(
    n=("order_id", "size"),
    n_amount=("amount", "count"),
    amt=("amount", "sum"),
)
print(g)`
},
{
  id: 'p43', stage: 7, title: 'merge：JOIN 的完整版',
  goal: 'left / inner / outer，以及"为什么行数变多了"',
  lesson: `~~~python
df.merge(users, on='user_id', how='left')     # LEFT JOIN
df.merge(users, on='user_id', how='inner')    # INNER JOIN
df.merge(users, on='user_id', how='outer')    # FULL OUTER JOIN
df.merge(users, left_on='user_id', right_on='uid')      # 列名不同
~~~
- [[how]] 取值：[[left]] / [[right]] / [[inner]] / [[outer]]，默认是 [[inner]]
- 两个表都有同名列（且不是连接键）会自动加后缀 [[_x]] / [[_y]]
- [[indicator=True]] 会多一列 [[_merge]]，告诉你每行来自哪边——排查"为什么丢了行"神器
- [[suffixes=('_o','_u')]] 自定义后缀

> 行数变多的唯一原因：**连接键在右表重复**。SQL 里也一样（笛卡尔积），pandas 不会警告你，所以 merge 之后一定要看 [[shape]]。`,
  sql: `SELECT o.order_id, o.amount, u.name
FROM orders o
LEFT JOIN users u ON o.user_id = u.user_id
WHERE o.status = 'paid';`,
  py: `users = pd.DataFrame({
    'user_id': [1, 2, 3, 4, 5],
    'name': ['张伟', '李娜', '王强', '陈静', '刘洋'],
    'vip': [1, 0, 1, 0, 1],
})
merged = df.merge(users, on='user_id', how='left')
print(merged.shape)`,
  note: 'SQL 的 JOIN 必须写全 ON 条件；pandas 的 merge 默认按同名列连接，容易"看起来对但连错了"。每次 merge 后先 print(shape) 是最便宜的自检。',
  task: `用 [[users]]（[[user_id, name, vip]] 三列）把 [[df]] LEFT JOIN 起来：
- [[merged]] = [[df.merge(users, on='user_id', how='left')]]
- 打印 [[merged.shape]]（应为 [[(21, 8)]]）
- [[paid]] = 只要 [[status == 'paid']] 的 [[order_id, name, amount]] 三列
打印 [[paid.head(3)]]`,
  starter: `users = pd.DataFrame({
    "user_id": [1, 2, 3, 4, 5],
    "name": ["张伟", "李娜", "王强", "陈静", "刘洋"],
    "vip": [1, 0, 1, 0, 1],
})

merged = df
paid = df

print(merged.shape)`,
  check: `assert merged.shape == (21, 8), 'merged 应该是 21 行 8 列，现在是 %r' % (merged.shape,)
assert set(['name', 'vip']) <= set(merged.columns), 'merged 要带上 name 和 vip'
assert merged[merged['user_id'] == 1]['name'].tolist() == ['张伟'] * 6, 'user_id=1 应该全是 张伟（6 行）'
assert paid.columns.tolist() == ['order_id', 'name', 'amount'] and len(paid) == 14, 'paid 要 3 列 14 行'`,
  hint: "merged = df.merge(users, on='user_id', how='left')；paid = merged.loc[merged['status']=='paid', ['order_id','name','amount']]。",
  answer: `users = pd.DataFrame({
    "user_id": [1, 2, 3, 4, 5],
    "name": ["张伟", "李娜", "王强", "陈静", "刘洋"],
    "vip": [1, 0, 1, 0, 1],
})

merged = df.merge(users, on="user_id", how="left")
paid = merged.loc[merged["status"] == "paid", ["order_id", "name", "amount"]]

print(merged.shape)
print(paid.head(3))`
},
{
  id: 'p44', stage: 7, title: '缺失值：NULL 在 pandas 里叫 NaN',
  goal: 'isna / fillna / dropna，外加 COALESCE',
  lesson: `~~~python
df['amount'].isna()          # 逐行判断 ←→ amount IS NULL
df['amount'].isna().sum()    # 空值个数
df['amount'].fillna(0)       # ←→ COALESCE(amount, 0)
df.dropna(subset=['amount']) # ←→ WHERE amount IS NOT NULL
df['amount'].fillna(df['amount'].mean())   # 用均值补
~~~
- 判断空值一律用 [[isna()]] / [[notna()]]，**不要用 [[== None]]**（NaN 和任何东西比较都是 False）
- [[fillna]] 返回新对象，原 df 不变；[[inplace=True]] 会改原表（不推荐，容易踩坑）
- [[dropna(how='all')]] 只在整行都空时才删

> 这是 SQL 转 pandas 最该先学的一关：SQL 里 [[NULL = NULL]] 是 unknown，pandas 里 [[NaN == NaN]] 是 False，两边都不能用等号判空。`,
  sql: `SELECT COUNT(*) FILTER (WHERE amount IS NULL) AS n_null,
       SUM(COALESCE(amount, 0))                    AS total_with_0
FROM orders;`,
  py: `n_null = df['amount'].isna().sum()      # 2
filled_total = df['amount'].fillna(0).sum()   # 2350.7
rows_notnull = df.dropna(subset=['amount']).shape[0]   # 19`,
  note: 'SQL 用 COALESCE 补默认值，pandas 用 fillna；SQL 用 IS NULL 判空，pandas 用 isna()。语义完全对得上，函数名不同。',
  task: `算出：
- [[n_null]] = amount 空值个数（[[2]]）
- [[filled_total]] = 把空值当 0 之后的总和（[[2350.7]]）
- [[rows_ok]] = 丢掉空值后的行数（[[19]]）
- [[no_null]] = 用 [[fillna(0)]] 补过的 Series（不能有 NaN）
打印前三个`,
  starter: `n_null = 0
filled_total = 0
rows_ok = 0
no_null = df['amount']

print(n_null, filled_total, rows_ok)`,
  check: `assert n_null == 2, 'n_null 应该是 2'
assert abs(filled_total - 2350.7) < 1e-6, 'filled_total 应该是 2350.7'
assert rows_ok == 19, 'rows_ok 应该是 19'
assert no_null.isna().sum() == 0, 'no_null 用 fillna(0) 之后不能有空值'`,
  hint: "df['amount'].isna().sum()；df['amount'].fillna(0).sum()；df.dropna(subset=['amount']).shape[0]；df['amount'].fillna(0)。",
  answer: `n_null = df["amount"].isna().sum()
filled_total = df["amount"].fillna(0).sum()
rows_ok = df.dropna(subset=["amount"]).shape[0]
no_null = df["amount"].fillna(0)

print(n_null, filled_total, rows_ok)`
},
{
  id: 'p45', stage: 7, title: 'shift：LAG / LEAD，取上一行',
  goal: '算环比、算相邻两单的时间差，都靠它',
  lesson: `~~~python
s = df.sort_values('created_at')['amount']
prev = s.shift(1)    # 上一行的值 ←→ LAG(amount) OVER (ORDER BY created_at)
next_ = s.shift(-1)  # 下一行的值 ←→ LEAD(amount)
diff = s - s.shift(1)  # 与前一行相减
~~~
- 第一行永远是 NaN（没有"上一行"）
- [[shift(1)]] 之前**必须**先按业务时间排序，否则拿到的是"原始文件里上一行"
- 想按用户分别取上一单，得先 [[groupby('user_id')]] 再 [[shift(1)]]

> 这是 pandas 里最像窗口函数的东西。规则一句话：**先排序（或先分组），再 shift**。`,
  sql: `SELECT order_id, amount,
       LAG(amount, 1) OVER (ORDER BY created_at) AS prev_amount
FROM orders;`,
  py: `ordered = df.sort_values('created_at').reset_index(drop=True)
ordered['prev_amount'] = ordered['amount'].shift(1)
print(ordered[['order_id', 'amount', 'prev_amount']].head(3))`,
  note: 'SQL 的 LAG 写在 OVER 里，排序也写在 OVER 里；pandas 的排序和 shift 是两步，所以更容易漏。漏排序 = 静默算错，不报错。',
  task: `- [[ordered]] = 按 [[created_at]] 升序排好并 [[reset_index(drop=True)]]
- 给它加一列 [[prev_amount]] = 上一行的 [[amount]]
- 打印 [[ordered[['order_id', 'amount', 'prev_amount']].head(4)]]

核对：第一行 [[prev_amount]] 是 NaN，第二行应该是 [[120.5]]。`,
  starter: `ordered = df.copy()
ordered['prev_amount'] = ordered['amount']

print(ordered.head(4))`,
  check: `assert ordered.iloc[0]['order_id'] == 1001, 'ordered 第一行应该是 1001（最早的单）'
assert ordered['prev_amount'].isna().sum() == 3, 'prev_amount 应该有 3 个空值（第一行 + amount 本身的两个 NaN 的后继行）'
assert abs(ordered.iloc[1]['prev_amount'] - 120.5) < 1e-9, '第二行的 prev_amount 应该是 120.5'`,
  hint: "ordered = df.sort_values('created_at').reset_index(drop=True)；ordered['prev_amount'] = ordered['amount'].shift(1)。",
  answer: `ordered = df.sort_values("created_at").reset_index(drop=True)
ordered["prev_amount"] = ordered["amount"].shift(1)

print(ordered[["order_id", "amount", "prev_amount"]].head(4))`
},
{
  id: 'p46', stage: 7, title: 'cumcount / rank / expanding：窗口函数全家桶',
  goal: 'ROW_NUMBER、RANK、累计求和，一次打穿',
  lesson: `| SQL 窗口 | pandas |
|---|---|
| [[ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at)]] | [[df.groupby('user_id').cumcount() + 1]] |
| [[RANK() OVER (PARTITION BY city ORDER BY amount DESC)]] | [[df.groupby('city')['amount'].rank(ascending=False)]] |
| [[SUM(amount) OVER (ORDER BY created_at)]] | [[s.expanding().sum()]] |
| [[AVG(amount) OVER (ORDER BY created_at ROWS 2 PRECEDING)]] | [[s.rolling(3).mean()]] |

- [[cumcount()]] 从 **0** 开始，所以"第几单"要 [[+1]]
- [[rank(method='dense')]] 并列给同一个名次；默认 [[average]]
- [[expanding()]] = 从第一行累计到当前行；[[rolling(3)]] = 最近 3 行滑动
- 分组内的累计：[[df.groupby('user_id')['amount'].cumsum()]]

> 这一关过了，你原来用窗口函数写的报表基本都能在 pandas 里复现——这也是"SQL 开发转 Python"最难也最值钱的一步。`,
  sql: `SELECT order_id, user_id, amount,
       ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) AS seq,
       SUM(amount) OVER (ORDER BY created_at) AS running
FROM orders;`,
  py: `df['seq'] = df.groupby('user_id').cumcount() + 1
running = df.sort_values('created_at')['amount'].fillna(0).expanding().sum()`,
  note: 'SQL 里窗口函数是一个 OVER 子句搞定；pandas 要拆成"分组 → 算 → 拼回列"三步。拆开后更灵活，但要小心索引对齐。',
  task: `给 [[df]] 加两列：
- [[seq]] = 每个用户自己的第几单（从 1 开始）
- [[running]] = 按 [[created_at]] 累计的金额和（空值当 0）

核对：第一行 [[running]] 应为 [[120.5]]；最后一行 [[running]] 应为 [[2350.7]]；用户 1 的 [[seq]] 应是 1..6。`,
  starter: `df['seq'] = 0
df['running'] = 0

print(df.head(3))`,
  check: `assert 'seq' in df.columns and 'running' in df.columns, '要加 seq 和 running 两列'
u1 = df[df['user_id'] == 1].sort_values('created_at')['seq'].tolist()
assert u1 == [1, 2, 3, 4, 5, 6], '用户 1 的 seq 应该是 1..6，现在是 %r' % (u1,)
assert abs(df.sort_values('created_at')['running'].iloc[0] - 120.5) < 1e-9, '第一行 running 应该是 120.5'
assert abs(df['running'].max() - 2350.7) < 1e-6, '累计到最后应该是 2350.7'`,
  hint: "df['seq'] = df.groupby('user_id').cumcount() + 1；running 用 df.sort_values('created_at')['amount'].fillna(0).expanding().sum() 再按索引赋回。",
  answer: `df['seq'] = df.groupby('user_id').cumcount() + 1
running = df.sort_values('created_at')['amount'].fillna(0).expanding().sum()
df['running'] = running.sort_index()

print(df.head(3))`
},

/* ============ 阶段八 · 数据库与 ETL ============ */
{
  id: 'p47', stage: 8, title: 'sqlite3：用 Python 连库查数',
  goal: 'conn / cursor / execute / fetch，所有数据库驱动都长这样',
  lesson: `~~~python
import sqlite3
conn = sqlite3.connect('/home/pyodide/demo.db')
cur = conn.cursor()
cur.execute('SELECT COUNT(*) FROM orders WHERE status = ?', ('paid',))   # 参数化！
row = cur.fetchone()          # 一行 → tuple
rows = cur.fetchall()         # 全部 → list of tuple
conn.close()
~~~
- 连接 → 游标 → 执行 → 取结果 → 关闭，这个套路 MySQL（pymysql）、PostgreSQL（psycopg2）、Oracle（cx_Oracle）都一样
- **永远用参数化查询**（[[?]] 占位符），不要用字符串拼 SQL——拼 SQL 就是 SQL 注入
- [[fetchone()]] 一个、[[fetchall()]] 全部、[[fetchmany(n)]] 一批

> 对照：你在 SQL 客户端里手敲一条 SELECT，等价于这里 execute + fetch。区别只是"谁来解析语法"。`,
  sql: `SELECT COUNT(*) AS paid_cnt FROM orders WHERE status = 'paid';`,
  py: `import sqlite3

conn = sqlite3.connect('/home/pyodide/demo.db')
cur = conn.cursor()
cur.execute('SELECT COUNT(*) FROM orders WHERE status = ?', ('paid',))
print(cur.fetchone()[0])
conn.close()`,
  note: '数据库客户端是"人写 SQL，工具执行"；Python 是"程序写 SQL，驱动执行"。参数化（? 占位）是唯一安全的姿势。',
  task: `用 [[sqlite3]] 连上 [[/home/pyodide/demo.db]]，查出 [[status = 'paid']] 的订单数存到 [[paid_cnt]]（应为 [[14]]），最后关闭连接。`,
  starter: `import sqlite3

conn = sqlite3.connect("/home/pyodide/demo.db")
cur = conn.cursor()

paid_cnt = 0

print(paid_cnt)`,
  check: `assert paid_cnt == 14, 'paid_cnt 应该是 14'
assert isinstance(paid_cnt, int), 'paid_cnt 要是整数（cur.fetchone()[0] 取出来的）'`,
  hint: "cur.execute('SELECT COUNT(*) FROM orders WHERE status = ?', ('paid',))，然后 paid_cnt = cur.fetchone()[0]。",
  answer: `import sqlite3

conn = sqlite3.connect("/home/pyodide/demo.db")
cur = conn.cursor()
cur.execute("SELECT COUNT(*) FROM orders WHERE status = ?", ("paid",))
paid_cnt = cur.fetchone()[0]
conn.close()

print(paid_cnt)`
},
{
  id: 'p48', stage: 8, title: 'read_sql：查询结果直接变 DataFrame',
  goal: '一条 SQL + 一行代码，取数就完了',
  lesson: `~~~python
agg = pd.read_sql("SELECT city, SUM(amount) amt FROM orders GROUP BY city", conn)
~~~
- [[pd.read_sql(查询, 连接)]] 直接返回 DataFrame，不用自己拼 cursor
- 第二个参数可以是 sqlite3 连接，也可以是 SQLAlchemy 的 [[engine]]（生产环境的标配）
- [[index_col='city']] 可以把某一列直接变索引

> 这就是数据开发最常用的组合拳：**复杂口径写在 SQL 里（你已经擅长），清洗和加工在 pandas 里**。不必为了"用 Python"把 SQL 翻译成 pandas。`,
  sql: `SELECT city, COUNT(*) AS n, SUM(amount) AS amt
FROM orders
WHERE status = 'paid'
GROUP BY city;`,
  py: `sql = "SELECT city, COUNT(*) AS n, SUM(amount) AS amt FROM orders WHERE status='paid' GROUP BY city"
agg = pd.read_sql(sql, conn)
print(agg)`,
  note: 'SQL 负责"口径"，pandas 负责"形状和加工"。这也是最省心的迁移路径：先 read_sql 把结果拿过来，再慢慢把逻辑往 pandas 挪。',
  task: `用 [[pd.read_sql]] 查"每个城市的已付订单数 n 与金额和 amt"存到 [[agg]]（4 行 3 列）：
- 打印 [[agg]]
- [[sz_amt]] = 深圳的 amt（[[993.5]]）
核对：深圳 n=7、amt=993.5；北京 n=1、amt=320.0。`,
  starter: `sql = "SELECT city, COUNT(*) AS n, SUM(amount) AS amt FROM orders WHERE status='paid' GROUP BY city"
agg = None
sz_amt = 0

print(agg, sz_amt)`,
  check: `assert agg is not None and agg.shape == (4, 3), 'agg 应该是 4 行 3 列'
assert set(agg.columns) == {'city', 'n', 'amt'}, '列名要 city / n / amt'
assert abs(sz_amt - 993.5) < 1e-6, 'sz_amt 应该是 993.5'
assert int(agg.loc[agg['city'] == '北京', 'n'].iloc[0]) == 1, '北京 n 应该是 1'`,
  hint: "agg = pd.read_sql(sql, conn)；sz_amt = agg.loc[agg['city']=='深圳','amt'].iloc[0]。",
  answer: `sql = "SELECT city, COUNT(*) AS n, SUM(amount) AS amt FROM orders WHERE status='paid' GROUP BY city"
agg = pd.read_sql(sql, conn)
sz_amt = agg.loc[agg["city"] == "深圳", "amt"].iloc[0]

print(agg)
print(sz_amt)`
},
{
  id: 'p49', stage: 8, title: 'to_sql：把 DataFrame 写回数据库',
  goal: '清洗结果落地，if_exists 决定覆盖还是追加',
  lesson: `~~~python
df.to_sql('paid_orders', conn, if_exists='replace', index=False)
~~~
- [[if_exists]]：[[replace]] 覆盖、[[append]] 追加、[[fail]] 表存在就报错（默认）
- [[index=False]] 一定要写，否则索引会变成一列写进去
- 写之前确认 dtype 对得上（含中文的列用 TEXT，金额用 REAL/DECIMAL）
- 生产环境用 [[engine]]（SQLAlchemy）+ [[chunksize=1000]] 分批，避免大表一次塞爆

> 这一步就是 ETL 的 Load。SQL 侧你会写 [[INSERT INTO ... SELECT]]，pandas 侧就是 [[to_sql]]。`,
  sql: `SELECT COUNT(*) AS rows_in_db FROM paid_orders;`,
  py: `paid = df[df['status'] == 'paid']
paid.to_sql('paid_orders', conn, if_exists='replace', index=False)
print(pd.read_sql('SELECT COUNT(*) c FROM paid_orders', conn))`,
  note: 'SQL 的 INSERT 需要你写列清单和值；to_sql 自动按 DataFrame 的列建表。代价是类型可能不如你意（比如该用 DECIMAL 的用了 REAL），生产上建议先建好表再 append。',
  task: `把 [[df]] 里 [[status == 'paid']] 的行写成表 [[paid_orders]]（[[if_exists='replace', index=False]]），再从库里查一下行数存到 [[cnt]]（应为 [[14]]）。`,
  starter: `paid = df

cnt = 0
print(cnt)`,
  check: `assert cnt == 14, 'paid_orders 表里应该有 14 行'
import sqlite3
c2 = sqlite3.connect('/home/pyodide/demo.db')
cols = c2.execute("PRAGMA table_info(paid_orders)").fetchall()
names = [r[1] for r in cols]
assert names == ['order_id', 'user_id', 'city', 'amount', 'status', 'created_at'], 'paid_orders 的列名不对（index=False 了吗？）%r' % (names,)
c2.close()`,
  hint: "paid = df[df['status']=='paid']；paid.to_sql('paid_orders', conn, if_exists='replace', index=False)；cnt 用 pd.read_sql 查。",
  answer: `paid = df[df["status"] == "paid"]
paid.to_sql("paid_orders", conn, if_exists="replace", index=False)
cnt = int(pd.read_sql("SELECT COUNT(*) c FROM paid_orders", conn)["c"].iloc[0])

print(cnt)`
},
{
  id: 'p50', stage: 8, title: 'executemany + commit：批量写入与事务',
  goal: '一条一条 INSERT 太慢，批量 + 事务才是正解',
  lesson: `~~~python
rows = [(6, '周敏', '杭州', 0), (7, '孙浩', '成都', 1)]
cur.executemany('INSERT INTO users VALUES (?, ?, ?, ?)', rows)
conn.commit()          # 不 commit 就等于没写
~~~
- [[executemany]] 一次提交多行，比 for 循环 execute 快一个数量级
- [[conn.commit()]] 提交事务；出错时 [[conn.rollback()]] 回滚
- 大量写入建议"攒批 + 定时 commit"（比如每 1000 行一次），别一行一个事务
- 插入前先查重（[[INSERT ... WHERE NOT EXISTS]] 或先 SELECT 一遍），避免重复数据

> 对照 SQL：[[BEGIN ... COMMIT]] 就是事务边界。Python 侧的 commit/rollback 完全对应，只是由你控制时机。`,
  sql: `BEGIN;
INSERT INTO users VALUES (8, '测试用户', '武汉', 0);
ROLLBACK;   -- 回滚后就查不到这一行了
SELECT COUNT(*) AS n FROM users;`,
  py: `rows = [(6, '周敏', '杭州', 0), (7, '孙浩', '成都', 1)]
cur.executemany('INSERT INTO users VALUES (?,?,?,?)', rows)
conn.commit()
print(cur.execute('SELECT COUNT(*) FROM users').fetchone()[0])`,
  note: 'SQL 客户端默认自动提交（或显式 BEGIN）；Python 驱动默认要你 commit。这就是"脚本跑完数据没进去"的最常见原因。',
  task: `往 [[users]] 表批量插入两行：[[(6, '周敏', '杭州', 0)]] 和 [[(7, '孙浩', '成都', 1)]]（用 [[executemany]] + [[commit]]），然后查总行数存到 [[user_cnt]]（应为 [[7]]）。`,
  starter: `rows = []
cur.executemany("INSERT INTO users VALUES (?,?,?,?)", rows)
conn.commit()

user_cnt = 0
print(user_cnt)`,
  check: `import sqlite3
c2 = sqlite3.connect('/home/pyodide/demo.db')
actual = c2.execute('SELECT COUNT(*) FROM users').fetchone()[0]
names = sorted(set(r[0] for r in c2.execute('SELECT name FROM users WHERE user_id >= 6').fetchall()))
c2.close()
assert user_cnt == actual, 'user_cnt 要等于库里真实行数（现在是 %r）' % actual
assert actual >= 7, 'users 至少要 7 行，现在是 %r（commit 了吗？）' % actual
assert names == ['周敏', '孙浩'], '插入的应该是 周敏 / 孙浩，现在是 %r' % (names,)`,
  hint: "rows = [(6,'周敏','杭州',0),(7,'孙浩','成都',1)]；executemany 之后 conn.commit()；user_cnt 用 SELECT COUNT(*) 查。",
  answer: `rows = [(6, "周敏", "杭州", 0), (7, "孙浩", "成都", 1)]
cur.executemany("INSERT INTO users VALUES (?,?,?,?)", rows)
conn.commit()

user_cnt = int(cur.execute("SELECT COUNT(*) FROM users").fetchone()[0])
print(user_cnt)`
},
{
  id: 'p51', stage: 8, title: '小项目：一条清洗流水线',
  goal: '读 → 转类型 → 补空 → 去重 → 落库，把前面学的串起来',
  lesson: `真实 ETL 的清洗步骤几乎固定是这五步：

1. **读**：[[pd.read_csv]] / [[read_sql]]
2. **转类型**：[[pd.to_numeric]]、[[pd.to_datetime]]
3. **补空值**：[[fillna]]（金额补 0，文本补 '未知'）
4. **去重**：[[drop_duplicates(subset=[...])]]
5. **落库**：[[to_sql(if_exists='replace')]]

~~~python
clean = df.copy()
clean['amount'] = pd.to_numeric(clean['amount'], errors='coerce').fillna(0)
clean['date'] = pd.to_datetime(clean['created_at'])
clean = clean.drop_duplicates(subset=['user_id', 'amount', 'created_at'])
clean.to_sql('clean_orders', conn, if_exists='replace', index=False)
~~~
> [[errors='coerce']] 的意思是"转不动的变 NaN"，比直接炸掉更适合脏数据场景。`,
  sql: `-- 清洗后的目标表长这样
SELECT COUNT(*) AS n, COUNT(DISTINCT user_id) AS users FROM clean_orders;`,
  py: `clean = df.copy()
clean['amount'] = pd.to_numeric(clean['amount'], errors='coerce').fillna(0)
clean['date'] = pd.to_datetime(clean['created_at'])
clean = clean.drop_duplicates(subset=['user_id', 'amount', 'created_at'])
print(clean.shape)`,
  note: 'SQL 里做这些要用一堆 CASE / COALESCE / DISTINCT ON；pandas 里是五个链式调用。清洗越复杂，pandas 的优势越明显。',
  task: `做一条清洗流水线，结果存到 [[clean]]：
1. [[clean = df.copy()]]
2. [[amount]] 转数值（[[errors='coerce']]）并 [[fillna(0)]]
3. 新增 [[date]] 列 = [[pd.to_datetime(clean['created_at'])]]
4. 按 [[['user_id', 'amount', 'created_at']]] 去重
5. 写回 sqlite 表 [[clean_orders]]（replace，不要索引）

核对：清洗后应为 **20 行**，amount 无空值。`,
  starter: `clean = df.copy()

print(clean.shape)`,
  check: `assert clean.shape[0] == 20, 'clean 应该是 20 行（去重掉 1 行），现在是 %r' % (clean.shape,)
assert clean['amount'].isna().sum() == 0, 'amount 不能有空值'
assert 'date' in clean.columns, '要新增 date 列'
assert str(clean['date'].dtype).startswith('datetime'), 'date 要是 datetime 类型'
import sqlite3
c2 = sqlite3.connect('/home/pyodide/demo.db')
n = c2.execute('SELECT COUNT(*) FROM clean_orders').fetchone()[0]
c2.close()
assert n == 20, 'clean_orders 表里应该是 20 行，现在是 %r' % n`,
  hint: '五步照着 lesson 里的代码块写，最后 to_sql("clean_orders", conn, if_exists="replace", index=False)。',
  answer: `clean = df.copy()
clean['amount'] = pd.to_numeric(clean['amount'], errors='coerce').fillna(0)
clean['date'] = pd.to_datetime(clean['created_at'])
clean = clean.drop_duplicates(subset=['user_id', 'amount', 'created_at'])
clean.to_sql('clean_orders', conn, if_exists='replace', index=False)

print(clean.shape)`
},

/* ============ 阶段九 · 工程化与进阶 ============ */
{
  id: 'p52', stage: 9, title: '类型注解：给函数贴上"列类型"',
  goal: '让 IDE 和同事一眼看懂参数是什么',
  lesson: `~~~python
def net_amount(amount: float, rate: float = 0.06) -> float:
    return round(amount * (1 - rate), 2)
~~~
- 参数后 [[: 类型]]，返回值前 [[-> 类型]]
- 只是"注解"，运行时**不做检查**（想强制检查用 mypy / pydantic）
- 复杂类型：[[list[str]]]、[[dict[str, float]]]、[[float | None]]
- [[__annotations__]] 能拿到这些注解，很多框架（FastAPI/Pydantic）就是靠它做校验的

> 对照 SQL 的 DDL：[[CREATE TABLE t (amount DECIMAL(10,2))]] 是数据库强制类型；Python 的注解是给人看的文档，靠工具校验。`,
  sql: `-- DDL 的类型是强制的
CREATE TABLE t (order_id INTEGER, amount DECIMAL(10,2));`,
  py: `def net_amount(amount: float, rate: float = 0.06) -> float:
    return round(amount * (1 - rate), 2)

print(net_amount(120.5))`,
  note: 'DDL 的类型错了插不进去；Python 注解写错了照样跑，只是 IDE 会飘黄。所以注解的价值在"协作和工具"，不在运行时。',
  task: `写 [[net_amount(amount: float, rate: float = 0.06) -> float]]，返回保留两位的税后金额；打印 [[net_amount(120.5)]]（[[113.27]]），并打印它的 [[__annotations__]]。`,
  starter: `def net_amount(amount, rate=0.06):
    return amount

print(net_amount(120.5))`,
  check: `assert abs(net_amount(120.5) - 113.27) < 1e-6, 'net_amount(120.5) 应该是 113.27'
ann = net_amount.__annotations__
assert ann.get('amount') is float and ann.get('rate') is float, '参数要标 float'
assert ann.get('return') is float, '返回值要标 -> float'`,
  hint: '参数和返回值都写 : float / -> float，函数体 round(amount * (1 - rate), 2)。',
  answer: `def net_amount(amount: float, rate: float = 0.06) -> float:
    return round(amount * (1 - rate), 2)

print(net_amount(120.5))
print(net_amount.__annotations__)`
},
{
  id: 'p53', stage: 9, title: 'logging：别再用 print 打日志',
  goal: '分级、带时间、能开关，出事故时救命的',
  lesson: `~~~python
import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger('etl')

logger.info('开始同步 orders')
logger.warning('发现 2 条空金额')
logger.error('写库失败')
~~~
- 五个级别：DEBUG < INFO < WARNING < ERROR < CRITICAL，[[basicConfig(level=...)]] 控制最低输出级别
- 用 [[logging.getLogger(名字)]] 拿一个"命名 logger"，方便按模块开关
- 别用 print 的原因：print 没级别、没时间、没法一键关掉、没法写到文件

> ETL 任务跑在凌晨，出问题时你只有日志。日志里带上表名、批次号、行数，排查时间能省一半。`,
  sql: `-- 数据库侧对应的是审计表 / 慢查询日志，思路一样：记录时间、级别、内容
SELECT DATE('now') AS today;`,
  py: `import logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s %(message)s')
logger = logging.getLogger('etl')
logger.info('开始同步')`,
  note: 'SQL 脚本里写日志一般靠 PRINT / RAISE NOTICE 或写审计表；Python 的 logging 是标准库，随手就能分级、落文件。',
  task: `写一个 [[setup_logger()]] 函数：
- 用 [[logging.basicConfig]] 设置 [[level=logging.INFO]]
- 返回 [[logging.getLogger('etl')]]
拿到 [[logger]] 后 [[logger.info('开始同步')]]，并检查 [[logging.getLogger().level == logging.INFO]]（basicConfig 设的是根 logger 的级别）。`,
  starter: `import logging

def setup_logger():
    return logging.getLogger("etl")

logger = setup_logger()`,
  check: `assert logger.name == 'etl', "logger 名字要是 'etl'"
assert logging.getLogger().level == logging.INFO, 'basicConfig 要把根 logger 设成 INFO'
assert len(logger.handlers) + len(logging.getLogger().handlers) >= 1, 'basicConfig 之后应该有 handler'
import io
assert isinstance(logger, logging.Logger), '要返回 Logger 实例'`,
  hint: "setup_logger 里先 logging.basicConfig(level=logging.INFO, format='%(levelname)s %(message)s')，再 return logging.getLogger('etl')。",
  answer: `import logging

def setup_logger():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    return logging.getLogger("etl")

logger = setup_logger()
logger.info("开始同步")`
},
{
  id: 'p54', stage: 9, title: '向量化 vs for 循环：性能差在哪',
  goal: 'pandas 里写循环基本等于自找慢',
  lesson: `同一件事三种写法：

~~~python
# 1. 最慢：逐行循环
total = 0
for i in range(len(df)):
    total += df.loc[i, 'amount']

# 2. 中等：Python 层循环
total = sum(x for x in df['amount'])

# 3. 最快：向量化（C 层一次算完）
total = df['amount'].sum()
~~~
- 向量化 = 把整个列交给底层 C 代码批量算，没有 Python 的逐行开销
- 常见替代：
  - [[apply(lambda)]] → 尽量换成列运算 [[df['a'] * df['b']]]
  - 条件判断 → [[np.where(条件, 值1, 值2)]] 或 [[df['col'].where(...)]]
  - 字符串处理 → [[df['col'].str.xxx]]
- 几万行以内感觉不明显，百万行差几十倍

> 判断标准：**代码里出现 [[for ... in df.itertuples()]]，先想想能不能换成列运算**。`,
  sql: `-- SQL 天生就是"集合式"的，没有逐行循环这个概念——pandas 的向量化就是同一思想
SELECT SUM(amount) AS total, SUM(amount * 1.1) AS taxed_total FROM orders;`,
  py: `print(df['amount'].sum())
print((df['amount'] * 1.1).sum())`,
  note: 'SQL 的 SUM / 表达式计算本来就是批量执行；pandas 的向量化操作是同一个思路在内存里的实现。写循环反而丢掉了这个优势。',
  task: `不用任何 for 循环，做两件事：
- [[taxed]] = [[df['amount']] * 1.1]] 这一列（缺失值保持缺失）
- [[taxed_total]] = [[taxed.sum()]]
打印 [[taxed_total]]（保留两位，应为 [[2585.77]]）`,
  starter: `taxed = df['amount']
taxed_total = 0

print(taxed_total)`,
  check: `assert hasattr(taxed, 'sum'), 'taxed 要是 Series'
assert abs(taxed_total - 2585.77) < 0.01, 'taxed_total 应该是 2585.77'
assert abs(taxed.iloc[0] - 132.55) < 1e-6, '第一行 taxed 应该是 132.55'`,
  hint: "taxed = df['amount'] * 1.1；taxed_total = round(taxed.sum(), 2)。",
  answer: `taxed = df["amount"] * 1.1
taxed_total = round(taxed.sum(), 2)

print(taxed_total)`
},
{
  id: 'p55', stage: 9, title: '收尾：__main__、argparse 与自测',
  goal: '把脚本变成"能交给调度器跑"的样子',
  lesson: `~~~python
import argparse

def build_parser():
    p = argparse.ArgumentParser(description='同步订单')
    p.add_argument('table')                              # 位置参数
    p.add_argument('--mode', default='append')           # 选项参数
    return p

if __name__ == '__main__':
    args = build_parser().parse_args()
    print(args.table, args.mode)
~~~
- [[if __name__ == '__main__':]] 保证"被 import 时不执行主逻辑"
- [[argparse]] 让脚本接受命令行参数，调度器传参就靠它
- 自测：写完函数先自己断言一遍（[[assert]]），或者用 [[pytest]] 写测试文件
- 目录结构建议：[[etl/]] 放逻辑、[[jobs/]] 放入口脚本、[[tests/]] 放测试、[[requirements.txt]] 锁版本

> 到这一步，你已经能写出"别人敢排进调度"的脚本了：有参数、有日志、有类型、有清洗、有落库、能自测。`,
  sql: `-- 调度器里跑 SQL 也一样要参数化，比如按日期分区
SELECT COUNT(*) FROM orders WHERE created_at >= '2026-01-01';`,
  py: `import argparse

def build_parser():
    p = argparse.ArgumentParser()
    p.add_argument('table')
    p.add_argument('--mode', default='append')
    return p

args = build_parser().parse_args(['orders', '--mode', 'overwrite'])
print(args.table, args.mode)`,
  note: 'SQL 脚本靠外部变量/参数文件传日期；Python 用 argparse，调度器（Airflow、DolphinScheduler、crontab）直接传 [[--mode overwrite]] 这种参数。',
  task: `写 [[build_parser()]]：
- 位置参数 [[table]]
- 选项 [[--mode]]，默认 [['append']]
- 选项 [[--batch]]，类型 int，默认 1000

然后用 [[parse_args(['orders', '--mode', 'overwrite', '--batch', '500'])]] 存到 [[args]]，打印 [[args.table]]、[[args.mode]]、[[args.batch]]。`,
  starter: `import argparse

def build_parser():
    p = argparse.ArgumentParser()
    return p

args = None
print(args)`,
  check: `args2 = build_parser().parse_args(['orders', '--mode', 'overwrite', '--batch', '500'])
assert args2.table == 'orders', 'table 位置参数不对'
assert args2.mode == 'overwrite', 'mode 选项不对'
assert args2.batch == 500 and isinstance(args2.batch, int), 'batch 要是 int 500'
assert args2 is not None and args.table == 'orders', 'args 要按任务里的参数解析'
assert build_parser().parse_args(['orders']).mode == 'append', 'mode 默认值要是 append'`,
  hint: "p.add_argument('table')；p.add_argument('--mode', default='append')；p.add_argument('--batch', type=int, default=1000)。",
  answer: `import argparse

def build_parser():
    p = argparse.ArgumentParser()
    p.add_argument('table')
    p.add_argument('--mode', default='append')
    p.add_argument('--batch', type=int, default=1000)
    return p

args = build_parser().parse_args(['orders', '--mode', 'overwrite', '--batch', '500'])
print(args.table, args.mode, args.batch)`
}
]);
