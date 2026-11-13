# Web component

`@iquji-cloud/web-component` 只提供通用 component 能力，JavaScript、类型声明、必要样式及功能测试随源码交付。

安装使用本目录锁文件，运行 `bun install --frozen-lockfile` 和 `bun run check`。正式入口只导出 `dist` 中的 JavaScript、类型声明和独立 CSS，不要求消费者编译本包源码。

JavaScript 构建显式使用生产环境的 JSX runtime，不依赖调用方 shell 的 `NODE_ENV`。自身检查通过正式包出口在独立生产 React 进程中渲染按钮、字段与图标，防止开发 JSX 产物进入生产消费者后白屏。

## AppShell 导航

`AppShell` 可用 `navigationGroups` 将链接按工作区分组。每组提供稳定的 `id`、可见标题和 `items`；组内项目继续使用 `AppNavigationItem` 的链接、图标、禁用和当前页状态。未提供分组时继续显示 `navigation` 平铺项目。侧栏标题使用真实分组标题，调用方不需要伪造分隔链接。

运行消费者需提供正式 icons、theme 与 React、Base UI 依赖，显式先导入 `@iquji-cloud/web-theme/tokens.css`，再导入 `@iquji-cloud/web-component/styles.css`；组件样式不隐式设置全局主题。当前源码开发的 icons 和 theme 使用相邻已构建工作区，其他叶子不进入本包闭包。

正式 component 产物通过精确 dependencies 声明 icons 与 theme；源码工作区使用明确的本地 overrides 定位相邻已构建工作区。这些本地安装映射不替代包消费者自己的正式依赖解析。

## 通知与表单

应用在 `IqujiOverlayProvider` 内、路由外注册 `IqujiNotificationProvider`，传入 `closeLabel`，可通过 `label` 注入通知区域名称（默认“通知”）。`placement` 支持 `topLeft`、`topRight`、`bottomLeft`、`bottomRight`，默认右上；`duration` 单位为毫秒，默认 4500，`0` 表示常驻；`maxCount` 默认 3，超出时关闭最早的通知。悬停、键盘聚焦或窗口失焦期间暂停自动关闭。

`useIqujiNotification()` 提供 `open({ key?, title, description?, tone?, duration?, actions?, onClose? })` 与 `close(key?)`。`open` 返回通知 key，重复 key 更新内容并重新计时；`tone` 沿用 `info | success | warning | danger`。不传 key 时创建独立通知，`close()` 关闭全部，`close(key)` 关闭指定通知。标题、正文与操作节点由应用提供；成功提交与实际执行结果须由应用准确区分，公共包不请求接口或宣称任务完成。

通知以中性浮层、状态图标和关闭按钮呈现，不占据内容布局。打开时不抢焦点，F6 可进入通知区域；在对话框或抽屉打开期间，通知 Portal 跟随顶层浮层，保留键盘操作和可访问边界。操作结果使用通知；字段校验、页面读取失败和需要持续阅读的说明继续使用字段错误或 `IqujiAlert`。

`IqujiField` 统一标签、必填标记、说明和错误间距，自动连接 `label`、`aria-describedby`、`aria-invalid`。Input、Textarea、Select 和 DatePicker 的中性聚焦描边使用 theme 独立控件变量，不再叠加带间隔的品牌色粗环；错误聚焦保持危险色，禁用与只读状态保留区别，高对比度模式使用系统焦点线。

## 操作状态

`IqujiButton`、`IconButton` 与 `IqujiButtonLink` 的 `disabled`、`loading` 都阻止操作。链接同时尊重 `aria-disabled=true`，禁用时移除 `href`、退出 Tab 顺序并阻止点击及其冒泡；恢复后继续使用原有目标、回调和 Tab 设置。

填充的 primary、danger 操作使用 theme 的 `--iquji-color-action-*` 变量，在明暗主题及悬停时保持白色文字或图标。禁用状态使用独立灰色变量，不通过整体透明度或保留红底表达不可用；进入禁用或恢复可用时，前景与底色同时切换，避免颜色过渡产生红底灰字的中间态。

## 页签

`IqujiTabs` 由 `value`、`onChange` 受控，`tabs` 提供 `value`、`label` 和可选的 `disabled`。默认使用下划线样式；`variant="segmented"` 使用按内容收紧的中性灰分段按钮，不把每项撑满整行。两种外观共用 `tablist` / `tab` 语义、选中态和单个可用 Tab 入口，方向键循环切换，Home/End 定位首尾，跳过禁用项，输入法组合期间不切换。

调用方通过 `label` 提供页签组名称，`panelId` 指向当前 `tabpanel`。需要建立面板的反向命名时传稳定 `id`，每个页签的正式 ID 为 `${id}-${value}`，面板将 `aria-labelledby` 设为当前页签 ID；未传 `id` 时组件生成唯一 ID。内容面板和数据加载仍由业务管理。

## 分页

`IqujiPagination` 使用唯一的 `page`、`pageSize`、`total` 和 `onPageChange` 合同；页码、页大小必须为正整数，总数为非负整数。边界操作与缺少变更回调的只读操作使用原生禁用状态，空结果保持一页且两端禁用，不查询数据或决定业务筛选。

应用注入 `label`、`previousLabel`、`nextLabel` 及可选的 `summary(total, range)`，公共包不读取应用词典。样式随正式 CSS 出口交付，应用无需生成分页配方。

## 浮层

应用在入口组合 `IqujiOverlayProvider`，通过 `IqujiDialog`、`IqujiDrawer`、`IqujiConfirmDialog`、`IqujiDropdownMenu` 和 `IqujiPopover` 使用同一套 Base UI 浮层。单个 Dialog 或 Drawer 在入口尚未提供 provider 时也有自身边界；需要跨容器排序时应共用应用入口的 provider。

Dialog 与 Drawer 使用受控的 `open`、`onOpenChange`。请求关闭时调用方可以保留 `open=true`，继续处理草稿或提交保护；实际退出完成才触发一次 `onCloseComplete`。该通知等待 CSS 动画完成、叠层释放及父层焦点管理恢复，不使用固定时长。重开或卸载取消旧轮完成，已打开的新容器不会被旧轮返回焦点打断。

关闭完成可用于清理业务会话或恢复业务入口。`destroyOnClose` 决定是否保留内容：Dialog 默认销毁，Drawer 默认保留；保留内容的容器在退出完成后使用正式 `hidden` 与 `display:none`，不会保留可见表面。叠层在退出期间继续维持滚动锁，最后一层退出恢复原有滚动状态。

祖先容器保持在仍活动的后代下方，即使祖先在子层退出期间重新打开，也不会抢先取得顶层焦点。Dialog 与 Drawer 均提供 `initialFocusRef`；宿主在关闭完成回调之后才新建或重开父容器时，通过该属性指定本轮初始入口。

关闭按钮、标题、说明和操作文字由应用传入。可关闭 Dialog 和所有 Drawer 必须提供 `closeLabel`；`mandatory` Dialog 禁止指针、Escape 和关闭按钮退出。`IqujiConfirmDialog` 的提交、成功和关闭由调用方决定，`confirmLoading` 使用正式禁用状态阻止取消和重复提交。

`IqujiConfirmDialog` 统一复用 `compact` 布局，默认宽度不超过 420px 和视口的 92%：标题和说明左对齐，关闭按钮在右上，不显示空正文；取消使用满宽 secondary 按钮，危险确认在其下方纵向排列。显式 `size` 或 `width` 仍覆盖默认尺寸，`width` 优先。初始焦点落在取消操作，显式 `initialFocusRef` 可以指定安全入口；`confirmDisabled` 仅禁止确认，仍允许继续编辑，`confirmLoading` 同时禁止取消和重复提交。`additionalActions` 可提供保存、保留草稿等业务决策，标题、说明和附加正文仍由调用方提供。普通 `IqujiDialog` 继续使用原表单宽度。

Dialog 和 Drawer 的表面 Portal 挂载到 `document.body`，菜单、Popover、Select 进入所属容器的浮层区域；这同时保留嵌套层级、顶层 Escape 与 WebKit 可访问性边界。浮层 CSS 全部随本包交付，消费者无需额外的应用构建配置；应用只保留业务表单组合和响应式布局。

`IqujiPopover.anchor` 沿 Base UI 接受元素、元素 ref、虚拟矩形或返回锚点的函数，省略时继续围绕触发器定位。触发按钮继续持有打开、关闭和焦点返回语义，定位仍由底座处理。需要按自身尺寸改变展开方向时，调用方可组合 `popupStyle` 的 CSS `translate` 与宽高过渡，并按实际视口约束尺寸。

`IqujiEmojiPicker.variant` 控制选择器触发按钮的强调程度，沿用 `IqujiButtonVariant`；省略时保留默认 `primary`，资料字段可显式使用 `secondary`。选项与清空操作继续使用原有按钮语义。

## 表单对话框与步骤

`IqujiFormDialog` 复用 `IqujiDialog` 的 Portal、层级、关闭保护和焦点返回，使用受控 `expanded`、`onExpandedChange` 与必填的 `expandLabel`、`collapseLabel`。普通模式居中显示，展开模式保持居中，宽度最多 1000px、高度不超过视口减去 64px，四周至少保留 16px 和圆角；标题与操作区固定，正文独立滚动，背景使用模糊遮罩。展开和收起只改变尺寸，不重建表单、不清空草稿，也不触发关闭。尺寸过渡沿用主题的浮层时长和标准缓动：在提交前后测量实际宽高，连续插值布局尺寸，不缩放文字；中途反向从当前尺寸继续，结束恢复自动高度。减少动态效果偏好直接切换目标尺寸，视口变化和卸载取消旧动画。

通用 Dialog 的 `heading` 接受顶部左侧的可视标题或面包屑；提供该插槽时，真实 `title` 仍通过视觉隐藏的 `Dialog.Title` 参与可访问命名。`headerActions` 允许在正式关闭按钮之前组合操作；FormDialog 用它加入展开按钮。`actions` 提供底部业务操作，`onOpenChange(false)` 仍由宿主决定是否允许关闭，不绕过未保存确认。

`IqujiFormSteps` 用 `label` 命名步骤导航，`steps` 包含 `id`、`label` 与可选的 `description`、`disabled`、`completed`。`completedLabel` 可注入供读屏使用的完成状态文案。`value`、`onChange(id)` 控制当前步骤和导航意图；公共组件不执行业务校验、不自动放行后续步骤。步骤以紧凑数字标记和连接线表示顺序，不套用卡片或整行底色；标签与说明保持整行，窄容器使用导航内部水平滚动，不将文字挤成逐字断行。导航使用有序列表和原生按钮，当前项提供 `aria-current="step"`；方向键、Home/End 移动焦点并跳过禁用项，Enter、Space 和点击才请求切换，输入法组合期间不处理方向键。

## 搜索弹窗

`IqujiSearchDialog` 使用受控的 `open`、`onOpenChange`，由调用方提供 `title`、`placeholder`、`emptyLabel`、`closeLabel`、`groups` 与 `onSelect(id)`。`groups` 是只读数组，每组包含 `id`、`label`、`items`；条目包含跨组唯一的 `id`、`title`，以及可选的 `description`、`keywords`、`metadata`、`icon`、`disabled`。`metadata` 与图标接受 React 节点，组件不生成业务数据或查询接口。

输入在标题、说明与关键词中进行不区分大小写的本地子串过滤，空分组不显示。关闭及重新打开清空查询；数据变化后保持仍有效的活动项，否则选择首个可用项，没有可用结果时移除 `aria-activedescendant`。方向键跨组循环跳过禁用项，Home/End 定位首尾，Enter 通知 `onSelect(id)`；输入法组合期间不处理这些快捷键。鼠标选择与键盘共用同一活动项，键盘移动会滚动到该项。

选择结果只通知调用方，不自动关闭。可直接导航时由调用方更新 `open=false`；需要草稿确认时保留搜索，待确认后再关闭，使取消确认能返回仍挂载的搜索输入。明确关闭按钮、Escape 和遮罩仍通过 `onOpenChange(false)` 请求关闭。

搜索弹窗消费正式 `IqujiDialog` 的层级、Escape、初始输入焦点及关闭后返回入口的合同。Dialog.Title 仍参与可访问命名，视觉只展示输入、分组结果与关闭图标；约 560px 宽的紧凑外观只作用于搜索弹窗，样式随正式 CSS 出口交付。

## 桌面壳

`IqujiDesktopShell` 只提供窗口外框，`windowBar`、`rail` 和内容区都由调用方组合。标准组合是 `IqujiDesktopTitleBar` + `IqujiDesktopTabStrip`、`IqujiDesktopRail` 和 `IqujiDesktopAccount`，业务内容放在 `children`。所有文案、图标、标签、账户数据、菜单项与回调都由调用方传入。

`IqujiDesktopTitleBar` 不渲染红黄绿窗口按钮，也不判断运行平台：

- 纯网页不传 `windowControls`，标题栏从导航操作开始；
- Electron 或自绘窗口按钮通过 `windowControls` 传入，并用 `windowControlsPlacement` 决定放在起始或结束侧；
- Tauri 等由系统覆盖绘制控件时，用 `windowControlsSpace` 预留起始或结束空间；
- Electron 拖拽区传 `dragRegion`，Tauri 的 `data-tauri-drag-region` 直接作为标题栏属性传入；两者都不影响纯网页。

`IqujiDesktopTabStrip` 使用 `activeTabId`、`onActiveTabChange`、`onTabClose`、`onTabAdd` 驱动标签切换、关闭和新增，支持方向键、Home/End、Delete、dirty 标记和关闭按钮文案。关闭按钮与标签选择按钮是兄弟节点，避免按钮嵌套。`IqujiDesktopRail` 的每个图标项提供 `label` 作为无障碍名称，`tooltip` 作为悬浮提示；激活项使用 `aria-current="page"`。`IqujiDesktopAccount` 复用 `IqujiPopover` 承载账户卡，`usage` 输出可访问的进度条，`sections` 定义分组操作、快捷键和危险/禁用状态。

`IqujiDesktopRail.showDivider` 默认是 `true`，保留图标栏与内容区之间的贯穿分隔线。调用方可传 `false` 隐藏这条线；切换时保留图标栏宽度、导航交互和无障碍语义，不影响工作台内部的拖拽分隔条。

## 三栏工作台

`IqujiWorkbenchLayout` 的 `center` 必填且始终渲染，`left`、`right` 不传即不显示；`leftCollapsed`、`rightCollapsed` 由调用方控制。折叠时内容保留挂载，但使用 `inert` 和 `aria-hidden` 退出交互与辅助技术树，宽度归零并隐藏分隔条。

布局使用三列 grid：左右轨道为 `minmax(0, width)`，中心轨道为 `minmax(centerMinWidth, 1fr)`，空间不足时先压缩两侧，中心仍保持最小宽度。左右分隔条支持指针拖拽、方向键/Home/End、双击恢复默认宽度，并使用 `role="separator"` 与正式 ARIA 数值。`leftWidth`/`rightWidth` 支持受控和非受控；调用方需要本地化分隔条名称时传 `leftResizeLabel`、`rightResizeLabel`。

`onLayoutChange` 接收 `IqujiWorkbenchGeometry`，报告实际渲染的 `leftWidth`、`centerWidth` 和 `rightWidth`，用于让窗口顶栏等外部区域跟随分栏边界。首次挂载、折叠与实际尺寸变化时测量，宽度相同不重复通知；缺失或折叠的侧栏报告 `0`。实际宽度通过 `ResizeObserver` 跟踪，不修改 `leftWidth`/`rightWidth` 的用户设定，也不触发其宽度调整回调。

## 设置页

`IqujiSettingsLayout` 只负责导航与内容的双栏关系，`IqujiSettingsNav` 的 `groups`、活动项、图标和搜索值都由调用方定义。搜索是受控输入，只上报字符串，不替调用方过滤数据；`emptyLabel` 用于调用方完成过滤后的空结果。

`IqujiSettingsContent`、`IqujiSettingsSection` 提供页面标题、分区标题和带分隔线的行容器。`IqujiSettingsRow` 是通用标题/说明/控件行；`IqujiSettingsSwitchRow` 复用 `IqujiSwitch` 并让整行可点击；`IqujiSettingsSelectRow` 复用 `IqujiSelect` 并把行标题与说明接到 `aria-labelledby`/`aria-describedby`；`IqujiSettingsActionRow` 用于值或路径加操作按钮。业务字段、选中状态和保存行为留在应用。

## 菜单

`IqujiDropdownMenu` 的 `items` 接受操作项、分隔线、分组标签和结构化子菜单。操作项支持 `icon`、`label`、`shortcut`、`keyshortcuts`、`disabled`、`tone` 与 `onSelect`；`kind: "submenu"` 用 `items` 递归组合子菜单，旧的 `submenu` 自定义节点仍可用于特殊内容。

菜单项至少 40px 高，图标、标签、快捷键和子菜单箭头使用统一样式。`shortcut` 只负责视觉展示，需要读屏快捷键语义时同时提供 `keyshortcuts`。`popupStyle`、`side`、`sideOffset` 和 `ariaLabel` 用于调用方控制弹层位置、宽度和名称；菜单触发器和业务操作仍由应用传入。

## 多选

`IqujiMultiSelect` 使用受控的 `value`、`onChange`，由调用方提供 `label`、`options`、`placeholder` 和可选文案。选项包含稳定的 `value`、显示用 `label`、可选说明与禁用状态；所有可见文案由应用注入。

触发器显示当前选中项的 `label`，浮层内使用 `IqujiPopover`、`IqujiCheckbox` 与 `IqujiInput` 组合。`searchable` 打开本地关键字过滤，`selectAllLabel`、`clearLabel` 分别提供全选与清空操作；禁用项不会被选中，清空只提交空数组。组件不读取应用词典，也不执行业务校验。

## 进度条

`IqujiProgressBar` 使用 `label`、`value`、`max` 表达确定进度，`max` 必须为正数，越界值在实际渲染时裁剪。`indeterminate` 表达不携带比例的运行中状态；此时不输出 `aria-valuenow`，避免伪造进度。

`tone` 支持 `neutral`、`info`、`success`、`warning`、`danger`；`showValue` 与 `formatValue` 控制可见数值，格式由调用方决定。减少动态效果时停止不定动画并保留可读状态。

## 时间线

`IqujiTimeline` 使用有序列表渲染 `items`，每项提供跨项唯一的 `id`、`title` 和可选的 `description`、`timestamp`、`status`、`icon`、`tone`。组件只负责时间线的结构与语义，不生成任务、审计或业务数据；空数组显示 `emptyLabel`，其中不带操作按钮。

## 滚动区域

`IqujiScrollArea` 提供带 `role="region"`、`aria-label` 和可聚焦滚动的通用容器。`height`、`maxHeight` 接受数字像素或字符串尺寸；`orientation` 支持 `vertical`、`horizontal` 和 `both`。滚动条、焦点环和 overscroll 行为随正式 CSS 交付，内容与业务滚动语义仍由调用方提供。
