/* PySQL Lab · 关卡内容（二）：阶段五 ~ 阶段六（第 28–36 关） */

window.LEVELS = window.LEVELS.concat([
/* ============ 阶段五 · 面向对象 ============ */
{
  id: 'o28', stage: 5, title: 'class 与 __init__：一行数据也能是个对象',
  goal: '把"一条订单"封装成对象，属性和方法绑在一起',
  lesson: `~~~python
class Order:
    def __init__(self, order_id, amount):
        self.order_id = order_id    # self = 这个实例自己
        self.amount = amount

o = Order(1001, 120.5)
print(o.amount)
~~~
- [[class]] 定义"模板"，[[Order(...)]] 创建"实例"
- [[__init__]] 是创建时自动跑的初始化函数
- [[self]] 必须写在第一个位置，指代当前实例（调用时**不用传**）
- 属性就是个普通变量，挂在 self 上

> 对照 SQL：一张表的 DDL 定义"列"，一个实例就是"一行"。区别是对象还能带方法（下面几关）。`,
  sql: `SELECT 1001 AS order_id, 120.5 AS amount, 'paid' AS status;`,
  py: `class Order:
    def __init__(self, order_id, amount, status='paid'):
        self.order_id = order_id
        self.amount = amount
        self.status = status

o = Order(1001, 120.5)
print(o.order_id, o.amount, o.status)`,
  note: 'SQL 的一行是"值 + 列名"，没有任何行为；Python 的对象能把"计算税额""判断是否退款"这类行为跟在数据后面。',
  task: `定义 [[class Order]]：
- [[__init__(self, order_id, amount, status='paid')]] 保存三个属性
- 创建 [[o = Order(1001, 120.5)]]
- 打印它的 [[order_id]] 和 [[amount]]`,
  starter: `class Order:
    def __init__(self):
        pass

o = Order()
print(o)`,
  check: `assert hasattr(Order, '__init__'), '要有 __init__'
o2 = Order(2001, 88.0)
assert o2.order_id == 2001 and abs(o2.amount - 88.0) < 1e-9, '实例要保存 order_id 和 amount'
assert o2.status == 'paid', "status 默认值要是 'paid'"
assert _captured, '要 print 出来'`,
  hint: 'init 里写 self.order_id = order_id 等三行；实例化时传 1001, 120.5。',
  answer: `class Order:
    def __init__(self, order_id, amount, status="paid"):
        self.order_id = order_id
        self.amount = amount
        self.status = status

o = Order(1001, 120.5)
print(o.order_id, o.amount)`
},
{
  id: 'o29', stage: 5, title: '方法：把计算挂在数据上',
  goal: '实例方法就是用 self 读自己字段的函数',
  lesson: `~~~python
class Order:
    def __init__(self, amount):
        self.amount = amount

    def tax(self, rate=0.06):        # 第一个参数永远是 self
        return round(self.amount * rate, 2)

o = Order(120.5)
print(o.tax())          # 7.23 ← 调用时不用传 self
~~~
- 定义在 class 里、第一个参数是 self 的函数 = 实例方法
- 方法里通过 [[self.xxx]] 访问属性
- 修改属性同理：[[self.status = 'refunded']]

> 对照 SQL：这相当于给"每一行"配一个可调用的计算规则。SQL 里只能用表达式（[[amount * 0.06]]），改规则得改 SQL；Python 里改方法一处即可。`,
  sql: `SELECT order_id, ROUND(amount * 0.06, 2) AS tax
FROM orders
WHERE status = 'paid'
LIMIT 3;`,
  py: `class Order:
    def __init__(self, amount):
        self.amount = amount
    def tax(self, rate=0.06):
        return round(self.amount * rate, 2)

print(Order(120.5).tax())`,
  note: 'SQL 的"规则"写死在 SQL 文本里，散落在几十个脚本中；封装成方法后，规则只有一份。这是从"写 SQL"到"写工程"的分水岭。',
  task: `给 [[Order]] 加两个方法：
- [[tax(rate=0.06)]] 返回税额（保留 2 位）
- [[mark_refunded()]] 把 [[self.status]] 改成 [['refunded']] 并返回 [['ok']]

创建 [[o = Order(120.5, 'paid')]]，打印 [[o.tax()]]，调 [[o.mark_refunded()]] 后再打印 [[o.status]]。`,
  starter: `class Order:
    def __init__(self, amount, status="paid"):
        self.amount = amount
        self.status = status

    def tax(self, rate=0.06):
        return 0

    def mark_refunded(self):
        return "no"

o = Order(120.5)
print(o.tax(), o.status)`,
  check: `assert abs(Order(120.5).tax() - 7.23) < 1e-6, 'tax() 应该返回 7.23'
assert Order(120.5).tax(0.1) == 12.05, 'tax(0.1) 应该返回 12.05'
o2 = Order(120.5)
assert o2.mark_refunded() == 'ok' and o2.status == 'refunded', 'mark_refunded 要改状态并返回 ok'
assert '7.23' in ' '.join(_captured), '要打印出税额 7.23'`,
  hint: 'tax 里 return round(self.amount * rate, 2)；mark_refunded 里 self.status = "refunded"，return "ok"。',
  answer: `class Order:
    def __init__(self, amount, status="paid"):
        self.amount = amount
        self.status = status

    def tax(self, rate=0.06):
        return round(self.amount * rate, 2)

    def mark_refunded(self):
        self.status = "refunded"
        return "ok"

o = Order(120.5)
print(o.tax())
o.mark_refunded()
print(o.status)`
},
{
  id: 'o30', stage: 5, title: '继承与 super：退款单也是订单',
  goal: '复用父类逻辑，只覆写不一样的部分',
  lesson: `~~~python
class Order:
    def __init__(self, amount):
        self.amount = amount
    def describe(self):
        return f'金额 {self.amount}'

class RefundOrder(Order):
    def __init__(self, amount, reason):
        super().__init__(amount)     # 调用父类的初始化
        self.reason = reason
    def describe(self):               # 覆写
        return super().describe() + f' 退款原因 {self.reason}'
~~~
- [[class 子类(父类):]] 继承
- [[super()]] 拿到父类，常用 [[super().__init__(...)]]
- 子类同名方法会**覆盖**父类（不是重载）

> 对照 SQL：视图/子查询能"套一层"，但改不了上游定义；Python 的继承是真正的"扩展 + 覆写"。`,
  sql: `SELECT order_id, amount, status,
       CASE WHEN status = 'refunded' THEN '退款单' ELSE '普通订单' END AS kind
FROM orders
LIMIT 3;`,
  py: `class Order:
    def __init__(self, amount):
        self.amount = amount
    def describe(self):
        return f'金额 {self.amount}'

class RefundOrder(Order):
    def __init__(self, amount, reason):
        super().__init__(amount)
        self.reason = reason
    def describe(self):
        return super().describe() + f' 退款原因 {self.reason}'`,
  note: 'SQL 里"退款单"通常靠 status 字段区分，所有逻辑挤在一个 CASE 里；Python 可以用类型区分，各管各的逻辑。',
  task: `已有 [[Order]]（有 [[describe()]] 返回 [[f'金额 {self.amount}']]），定义 [[RefundOrder(Order)]]：
- [[__init__(self, amount, reason)]] 里用 [[super().__init__(amount)]]
- [[describe()]] 返回父类描述 + [[' 退款原因 ']] + reason

创建 [[r = RefundOrder(45.0, '重复下单')]]，打印 [[r.describe()]]，应为 [[金额 45.0 退款原因 重复下单]]。`,
  starter: `class Order:
    def __init__(self, amount):
        self.amount = amount
    def describe(self):
        return f"金额 {self.amount}"

class RefundOrder(Order):
    pass

r = RefundOrder(45.0, "重复下单")
print(r.describe())`,
  check: `assert isinstance(RefundOrder(45.0, 'x'), Order), 'RefundOrder 要继承 Order'
assert RefundOrder(45.0, '重复下单').describe() == '金额 45.0 退款原因 重复下单', 'describe 输出不对'
assert _captured and _captured[-1].strip() == '金额 45.0 退款原因 重复下单', '最后一行输出不对'`,
  hint: '子类写 __init__ 调 super().__init__(amount)，再存 reason；describe 用 super().describe() 拼字符串。',
  answer: `class Order:
    def __init__(self, amount):
        self.amount = amount
    def describe(self):
        return f"金额 {self.amount}"

class RefundOrder(Order):
    def __init__(self, amount, reason):
        super().__init__(amount)
        self.reason = reason
    def describe(self):
        return super().describe() + f" 退款原因 {self.reason}"

r = RefundOrder(45.0, "重复下单")
print(r.describe())`
},
{
  id: 'o31', stage: 5, title: '魔术方法：__repr__ / __len__ / __eq__',
  goal: '让对象像内置类型一样被打印、被比较',
  lesson: `名字两边各两个下划线的"魔术方法"是 Python 的钩子：

- [[__repr__]] 决定 [[print(o)]] 显示什么（默认是难看的内存地址）
- [[__len__]] 让 [[len(o)]] 能用
- [[__eq__]] 决定 [[o1 == o2]] 怎么比（默认比"是不是同一个对象"）

~~~python
def __repr__(self):
    return f'Order({self.order_id}, {self.amount})'
~~~
> 调试 ETL 时，[[__repr__]] 写得好，日志里直接能看懂对象是什么，省一半时间。`,
  sql: `SELECT order_id, amount, status FROM orders WHERE order_id = 1001;`,
  py: `class Order:
    def __init__(self, order_id, amount):
        self.order_id, self.amount = order_id, amount
    def __repr__(self):
        return f'Order({self.order_id}, {self.amount})'
    def __eq__(self, other):
        return self.order_id == other.order_id

print(Order(1001, 120.5))`,
  note: 'SQL 查出来永远是一张表、一堆列；Python 对象打印出来是什么样，完全由你决定——日志可读性就是这么来的。',
  task: `给 [[Order]] 加三个魔术方法：
- [[__repr__]] → [[Order(1001, 120.5)]]
- [[__len__]] → 返回 2（代表有两个业务字段）
- [[__eq__]] → order_id 相同即视为相等

打印一个 [[Order(1001, 120.5)]]，并打印 [[Order(1001, 1.0) == Order(1001, 2.0)]]（应为 True）。`,
  starter: `class Order:
    def __init__(self, order_id, amount):
        self.order_id = order_id
        self.amount = amount

o = Order(1001, 120.5)
print(o)
print(o == Order(1001, 999.0))`,
  check: `assert repr(Order(1001, 120.5)) == 'Order(1001, 120.5)', '__repr__ 输出不对'
assert len(Order(1001, 120.5)) == 2, '__len__ 要返回 2'
assert (Order(1001, 1.0) == Order(1001, 2.0)) is True, '__eq__ 要按 order_id 比'
assert (Order(1001, 1.0) == Order(1002, 1.0)) is False, 'order_id 不同要不相等'`,
  hint: '三个方法分别 return 字符串、return 2、return self.order_id == other.order_id。',
  answer: `class Order:
    def __init__(self, order_id, amount):
        self.order_id = order_id
        self.amount = amount
    def __repr__(self):
        return f"Order({self.order_id}, {self.amount})"
    def __len__(self):
        return 2
    def __eq__(self, other):
        return self.order_id == other.order_id

print(Order(1001, 120.5))
print(Order(1001, 1.0) == Order(1001, 2.0))`
},
{
  id: 'o32', stage: 5, title: 'dataclass：少写一半样板代码',
  goal: '字段多的实体，别手写 __init__ / __repr__ / __eq__',
  lesson: `[[@dataclass]] 会自动生成 [[__init__]]、[[__repr__]]、[[__eq__]]：

~~~python
from dataclasses import dataclass, field

@dataclass
class Order:
    order_id: int
    amount: float
    status: str = 'paid'
    tags: list = field(default_factory=list)   # 可变默认值必须这样写
~~~
- 字段写在类下面，用**类型注解**声明
- 带默认值的字段必须放在后面
- [[field(default_factory=...)] ] 用于 list/dict 这种可变默认值（直接写 [[[]]] 会所有实例共享同一个列表）

> 对照 SQL：这就相当于"带类型和默认值的 DDL"，而且自动生成等值比较——审单、去重都用得上。`,
  sql: `-- SQL 的 DDL 也是"字段 + 类型 + 默认值"
CREATE TABLE t (order_id INTEGER, amount REAL DEFAULT 0, status TEXT DEFAULT 'paid');`,
  py: `from dataclasses import dataclass, field

@dataclass
class Order:
    order_id: int
    amount: float
    status: str = 'paid'

print(Order(1001, 120.5))`,
  note: 'DDL 里 DEFAULT 写在列定义上；dataclass 里默认值写在字段后面。区别是 dataclass 还顺手给了你 __eq__ 和 __repr__。',
  task: `用 [[@dataclass]] 定义 [[Order]]，字段：[[order_id: int]]、[[amount: float]]、[[status: str = 'paid']]；创建 [[o = Order(1001, 120.5)]]，打印 [[o]]，并打印 [[o == Order(1001, 120.5)]]（应为 True）。`,
  starter: `from dataclasses import dataclass

@dataclass
class Order:
    order_id: int

o = Order(1001)
print(o)`,
  check: `assert o.order_id == 1001 and abs(o.amount - 120.5) < 1e-9, '字段要齐：order_id / amount'
assert o.status == 'paid', 'status 默认值要是 paid'
assert (o == Order(1001, 120.5)) is True, 'dataclass 自动生成的 __eq__ 要能用'
assert "'Order'" in repr(o) or 'Order(' in repr(o), '打印出来应该是 dataclass 自动生成的形式'`,
  hint: '三个字段按顺序写，status 给默认值；实例化时传两个参数。',
  answer: `from dataclasses import dataclass

@dataclass
class Order:
    order_id: int
    amount: float
    status: str = "paid"

o = Order(1001, 120.5)
print(o)
print(o == Order(1001, 120.5))`
},

/* ============ 阶段六 · 迭代器 / 生成器 / 装饰器 ============ */
{
  id: 'o33', stage: 6, title: '迭代协议：for 到底在做什么',
  goal: '理解 __iter__ / __next__，就理解了为什么数据库游标能 for 着读',
  lesson: `[[for x in obj]] 背后是：

1. 调 [[obj.__iter__()]] 拿到迭代器
2. 反复调 [[next(迭代器)]] 直到抛 [[StopIteration]]

自己实现：
~~~python
class Pager:
    def __init__(self, rows, size):
        self.rows, self.size, self.i = rows, size, 0
    def __iter__(self):
        return self
    def __next__(self):
        if self.i >= len(self.rows):
            raise StopIteration
        page = self.rows[self.i:self.i + self.size]
        self.i += self.size
        return page
~~~
> 这就是"分页拉数"的标准写法：[[for page in Pager(rows, 1000)]]，一次只处理一页，内存不会爆。`,
  sql: `SELECT order_id FROM orders ORDER BY order_id LIMIT 3 OFFSET 0;  -- 第 1 页
-- 换成 OFFSET 3 就是第 2 页，程序里就是循环调这个���句`,
  py: `class Pager:
    def __init__(self, rows, size):
        self.rows, self.size, self.i = rows, size, 0
    def __iter__(self):
        return self
    def __next__(self):
        if self.i >= len(self.rows):
            raise StopIteration
        page = self.rows[self.i:self.i + self.size]
        self.i += self.size
        return page

for page in Pager(list(range(1, 8)), 3):
    print(page)`,
  note: 'SQL 的分页是 LIMIT/OFFSET，要你在循环里改 offset；Python 的迭代器把"翻页"藏在 __next__ 里，调用方只管 for。',
  task: `实现 [[Pager(rows, size)]]：
- [[__iter__]] 返回 self
- [[__next__]] 每次返回一页（[[rows]] 切片），取完抛 [[StopIteration]]
用 [[Pager([1, 2, 3, 4, 5, 6, 7], 3)]] 循环，把每一页收集到 [[pages]]（list）并打印 [[pages]]，应为 [[[[1,2,3],[4,5,6],[7]]]]。`,
  starter: `class Pager:
    def __init__(self, rows, size):
        self.rows = rows
        self.size = size
        self.i = 0

    def __iter__(self):
        return iter(self.rows)

pages = []
for p in Pager([1, 2, 3, 4, 5, 6, 7], 3):
    pages.append(p)

print(pages)`,
  check: `assert pages == [[1, 2, 3], [4, 5, 6], [7]], "pages 应该是 [[1,2,3],[4,5,6],[7]]"
assert isinstance(Pager([1], 1).__iter__(), object), '__iter__ 要实现'`,
  hint: '__iter__ 返回 self；__next__ 里先判断 self.i >= len(self.rows) 就 raise StopIteration，否则切片并 self.i += self.size。',
  answer: `class Pager:
    def __init__(self, rows, size):
        self.rows = rows
        self.size = size
        self.i = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.i >= len(self.rows):
            raise StopIteration
        page = self.rows[self.i:self.i + self.size]
        self.i += self.size
        return page

pages = []
for p in Pager([1, 2, 3, 4, 5, 6, 7], 3):
    pages.append(p)

print(pages)`
},
{
  id: 'o34', stage: 6, title: 'yield 生成器：用一行代码写迭代',
  goal: '生成器 = 自动维护状态的迭代器，最省内存的"逐行处理"',
  lesson: `函数里出现 [[yield]]，它就变成**生成器函数**：调用时不执行，只在 [[next()]] 时跑一步、产出一次。

~~~python
def read_in_batches(rows, size):
    for i in range(0, len(rows), size):
        yield rows[i:i + size]

for batch in read_in_batches(data, 1000):
    process(batch)
~~~
- 状态（循环变量）自动保存，不用像上面 Pager 那样自己存 [[self.i]]
- 惰性求值：[[list(gen)]] 才会真的跑完；不取就一步都不跑
- 适合"读大文件 / 拉大量数据"，内存只保留一批

> 对照 SQL：数据库游标（cursor）就是"一次一行"；生成器让你在 Python 侧用同样的方式对待一个 CSV、一个接口、一个文件。`,
  sql: `-- 游标式读取：每次拿一批，内存里只有这一批
SELECT order_id, amount FROM orders ORDER BY order_id LIMIT 5;`,
  py: `def batches(rows, size):
    for i in range(0, len(rows), size):
        yield rows[i:i + size]

print(list(batches([1, 2, 3, 4, 5], 2)))`,
  note: 'SQL 一次返回全部结果集（客户端驱动一般也是全取）；生成器是"要一批才给一批"，大表迁移时这点决定会不会 OOM。',
  task: `写生成器 [[batches(rows, size)]]，每次 [[yield]] 一批；调用 [[list(batches([1,2,3,4,5,6,7], 3))]] 存到 [[out]]，并打印 [[out]]（应为 [[[[1,2,3],[4,5,6],[7]]]]）。`,
  starter: `def batches(rows, size):
    return [rows]

out = list(batches([1, 2, 3, 4, 5, 6, 7], 3))
print(out)`,
  check: `assert out == [[1, 2, 3], [4, 5, 6], [7]], "out 应该是 [[1,2,3],[4,5,6],[7]]"
assert list(batches([9], 2)) == [[9]], 'batches 要能用小数据跑通'`,
  hint: '把 return 换成 for i in range(0, len(rows), size): yield rows[i:i+size]。',
  answer: `def batches(rows, size):
    for i in range(0, len(rows), size):
        yield rows[i:i + size]

out = list(batches([1, 2, 3, 4, 5, 6, 7], 3))
print(out)`
},
{
  id: 'o35', stage: 6, title: '装饰器：给函数套一层',
  goal: '计时、重试、日志，都不用改函数本体',
  lesson: `装饰器本质是"函数接收函数、返回函数"：

~~~python
import functools

def trace(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        print('开始', fn.__name__)
        result = fn(*args, **kwargs)
        print('结束', fn.__name__)
        return result
    return wrapper

@trace
def add(a, b):
    return a + b
~~~
- [['@trace']] 等价于 [[add = trace(add)]]
- wrapper 里 [[*args, **kwargs]] 原样转发参数
- [[functools.wraps]] 保住原函数的名字和文档（不写的话 [[add.__name__]] 会变成 wrapper）

> ETL 里最实用的三个装饰器：计时、失败重试、写审计日志。`,
  sql: `-- SQL 没有装饰器；等效做法是在每个任务外面套一层调度/审计
SELECT order_id, amount FROM orders WHERE status = 'paid' LIMIT 3;`,
  py: `import functools

def trace(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        print('开始', fn.__name__)
        r = fn(*args, **kwargs)
        print('结束', fn.__name__)
        return r
    return wrapper

@trace
def add(a, b):
    return a + b

print(add(1, 2))`,
  note: 'SQL 脚本的"计时/重试"一般靠外部调度器（Airflow、DolphinScheduler）包；Python 可以用装饰器在函数级别做到，而且能复用。',
  task: `写装饰器 [[trace(fn)]]，用 [[functools.wraps]] 包装：
- 调用前打印 [[开始 函数名]]
- 调用后打印 [[结束 函数名]]
- 返回原结果

用它装饰 [[add(a, b)]] 并 [[print(add(1, 2))]]（应为 3），同时保证 [[add.__name__ == 'add']]。`,
  starter: `import functools

def trace(fn):
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)
    return wrapper

@trace
def add(a, b):
    return a + b

print(add(1, 2))`,
  check: `assert add(1, 2) == 3, 'add(1,2) 应该返回 3'
assert add.__name__ == 'add', '要用 functools.wraps 保住函数名'
cap = _captured
assert any(l.startswith('开始 add') for l in cap), '要打印「开始 add」'
assert any(l.startswith('结束 add') for l in cap), '要打印「结束 add」'`,
  hint: '在 wrapper 里前后各 print 一行，加上 @functools.wraps(fn)。',
  answer: `import functools

def trace(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        print('开始', fn.__name__)
        r = fn(*args, **kwargs)
        print('结束', fn.__name__)
        return r
    return wrapper

@trace
def add(a, b):
    return a + b

print(add(1, 2))`
},
{
  id: 'o36', stage: 6, title: '上下文管理器：自己写 with',
  goal: '连接、事务、临时文件——"必须收尾"的东西都要它',
  lesson: `[[with 对象 as x:]] 的对象要实现两个方法：

- [[__enter__]]：进入时执行，返回值给 [[as]] 后面的变量
- [[__exit__]]：退出时一定执行（无论是否抛异常），返回值决定异常要不要继续抛（[[True]] = 吞掉）

~~~python
class Conn:
    def __enter__(self):
        print('打开连接'); return self
    def __exit__(self, exc_type, exc, tb):
        print('关闭连接'); return False
    def query(self):
        return 21
~~~
> 对照 SQL 事务：[[BEGIN ... COMMIT/ROLLBACK]] 就是数据库侧的"上下文"；Python 的 [[with]] 是客户端侧的同一思想：进去开、出来必关。`,
  sql: `BEGIN;
  UPDATE orders SET status = 'paid' WHERE order_id = 1001;
ROLLBACK;  -- 出错就回滚，等价于 __exit__ 里的清理`,
  py: `class Conn:
    def __enter__(self):
        print('打开连接'); return self
    def __exit__(self, exc_type, exc, tb):
        print('关闭连接'); return False
    def query(self):
        return 21

with Conn() as c:
    print(c.query())`,
  note: 'with 保证"出了事也关连接"；手写 open/close 一旦中间抛异常就可能泄漏连接——这是连接池耗尽最常见的原因。',
  task: `实现 [[Conn]]：
- [[__enter__]] 打印 [['open']] 并返回 self
- [[__exit__]] 打印 [['close']]
- [[query()]] 返回 [[21]]

用 [[with Conn() as c:]] 打印 [[c.query()]]；再验证：with 块内抛异常时 [[close]] 也会打印（用 [[try/except]] 包住一个 [[raise ValueError]] 的 with 块）。`,
  starter: `class Conn:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        return False
    def query(self):
        return 0

with Conn() as c:
    print(c.query())`,
  check: `assert 'open' in _captured and 'close' in _captured, '要打印 open 和 close'
assert '21' in '\\n'.join(_captured), 'query 要返回 21'
assert _captured.count('close') >= 2, '异常场景下也要 close（说明 __exit__ 被调用了）'`,
  hint: '三个方法分别 print + return；异常场景用 try: with Conn() as c: raise ValueError 然后 except 住。',
  answer: `class Conn:
    def __enter__(self):
        print('open')
        return self
    def __exit__(self, exc_type, exc, tb):
        print('close')
        return False
    def query(self):
        return 21

with Conn() as c:
    print(c.query())

try:
    with Conn() as c2:
        raise ValueError('模拟出错')
except ValueError:
    pass`
}
]);
