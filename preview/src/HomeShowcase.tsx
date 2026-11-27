import {
  IconButton,
  IqujiButton,
  IqujiDataTable,
  IqujiSwitch,
  StatusBadge,
} from "@iquji-community/web-component";
import { IqujiIcon } from "@iquji-community/web-icons";
import { useState } from "react";
import {
  CATEGORIES,
  type CommunityPackage,
  type ComponentCategory,
} from "./catalog";
import { CATEGORY_METADATA } from "./i18n/locales";
import "@iquji-community/web-theme/tokens.css";
import "@iquji-community/web-component/styles.css";

type HomeShowcaseProps = {
  language: "en" | "zh";
  packages: { id: CommunityPackage; description: string }[];
  examples: {
    id: string;
    name: string;
    category: ComponentCategory;
    packageId: CommunityPackage;
  }[];
};

function WorkbenchPreview({ language }: Pick<HomeShowcaseProps, "language">) {
  const chinese = language === "zh";
  const [activeOnly, setActiveOnly] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const projects = [
    { name: "Atlas", owner: "Lin", active: true },
    { name: "Northstar", owner: "Jules", active: false },
    { name: "Meridian", owner: "Sam", active: true },
  ];

  return (
    <section
      className="home-workbench"
      aria-label={chinese ? "工作台示例" : "Workbench example"}
    >
      <div className="home-workbench__bar">
        <IqujiIcon decorative name="layout-dashboard" size={15} />
        {chinese ? "项目工作台" : "Project workbench"}
        <StatusBadge tone="positive">
          {chinese ? "已同步" : "Synced"}
        </StatusBadge>
      </div>
      <div className="home-workbench__body">
        <div className="home-workbench__toolbar">
          <strong>{chinese ? "项目" : "Projects"}</strong>
          <IconButton
            compact
            aria-expanded={showDetails}
            label={chinese ? "表格说明" : "About this table"}
            icon={<IqujiIcon decorative name="circle-info" size={16} />}
            onClick={() => setShowDetails((shown) => !shown)}
          />
        </div>
        {showDetails && (
          <p>
            {chinese
              ? "此表格使用 IqujiDataTable，状态由调用方管理。"
              : "This table uses IqujiDataTable with caller-owned state."}
          </p>
        )}
        <IqujiSwitch
          checked={activeOnly}
          onChange={(event) => setActiveOnly(event.currentTarget.checked)}
          label={chinese ? "只看进行中" : "Active only"}
        />
        <IqujiDataTable
          className="home-workbench__table"
          label={chinese ? "示例项目" : "Sample projects"}
          data={
            activeOnly ? projects.filter((project) => project.active) : projects
          }
          columns={[
            { accessorKey: "name", header: chinese ? "名称" : "Name" },
            { accessorKey: "owner", header: chinese ? "负责人" : "Owner" },
            {
              accessorKey: "active",
              header: chinese ? "状态" : "Status",
              cell: ({ row }) =>
                row.original.active ? (
                  <StatusBadge tone="neutral">
                    {chinese ? "进行中" : "In progress"}
                  </StatusBadge>
                ) : (
                  <StatusBadge tone="positive">
                    {chinese ? "已完成" : "Complete"}
                  </StatusBadge>
                ),
            },
          ]}
        />
      </div>
    </section>
  );
}

const packageIcons = {
  component: "boxes",
  editor: "pencil",
  i18n: "languages",
  icons: "sparkles",
  motion: "play",
  network: "network",
  query: "refresh",
  theme: "sun",
} as const;

export default function HomeShowcase({
  language,
  examples,
  packages,
}: HomeShowcaseProps) {
  const chinese = language === "zh";
  const base = chinese ? "/zh/" : "/";
  const [category, setCategory] = useState<ComponentCategory | "all">("all");
  const groups = category === "all" ? CATEGORIES : [category];

  return (
    <main className="community-home" id="main-content">
      <section className="community-home__hero">
        <div className="community-home__intro">
          <h1>
            Iquji Community <span>Web</span>
          </h1>
          <p>
            {chinese
              ? "用于构建表单、数据表格、编辑器和桌面工作台的 React 组件与 TypeScript 工具。"
              : "React components and TypeScript utilities for forms, data tables, editors, and desktop workbenches."}
          </p>
          <div className="community-home__actions">
            <a
              className="community-home__button community-home__button--primary"
              href="#components"
            >
              {chinese ? "浏览组件" : "Browse components"}
              <IqujiIcon decorative name="arrow-down" size={15} />
            </a>
            <a className="community-home__button" href={`${base}component`}>
              {chinese ? "快速开始" : "Get started"}
              <IqujiIcon decorative name="arrow-right" size={15} />
            </a>
          </div>
        </div>
        <WorkbenchPreview language={language} />
      </section>

      <section className="community-home__section" aria-labelledby="packages">
        <h2 id="packages">{chinese ? "软件包" : "Packages"}</h2>
        <div className="community-home__packages">
          {packages.map(({ id, description }) => (
            <a
              className="community-home__package"
              href={`${base}${id}`}
              key={id}
            >
              <span className="community-home__package-icon">
                <IqujiIcon decorative name={packageIcons[id]} size={18} />
              </span>
              <div>
                <strong>web-{id}</strong>
                <p>{description}</p>
              </div>
              <IqujiIcon
                className="community-home__link-icon"
                decorative
                name="arrow-right"
                size={16}
              />
            </a>
          ))}
        </div>
      </section>

      <section className="community-home__section" aria-labelledby="components">
        <h2 id="components">{chinese ? "组件目录" : "Component catalog"}</h2>
        <div className="community-home__filters">
          <IqujiButton
            aria-pressed={category === "all"}
            onClick={() => setCategory("all")}
            variant="secondary"
          >
            {chinese ? "全部" : "All"}
          </IqujiButton>
          {CATEGORIES.map((item) => (
            <IqujiButton
              key={item}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              variant="secondary"
            >
              <IqujiIcon
                decorative
                name={CATEGORY_METADATA[item].iconName}
                size={15}
              />
              {CATEGORY_METADATA[item][chinese ? "nameZh" : "nameEn"]}
            </IqujiButton>
          ))}
        </div>
        <div className="community-home__groups">
          {groups.map((item) => (
            <section key={item} className="community-home__group">
              <h3>{CATEGORY_METADATA[item][chinese ? "nameZh" : "nameEn"]}</h3>
              <ul>
                {examples
                  .filter((example) => example.category === item)
                  .map((example) => (
                    <li key={example.id}>
                      <a
                        href={`${base}${example.packageId}#example-${example.id}`}
                      >
                        {example.name}{" "}
                        <IqujiIcon decorative name="chevron-right" size={14} />
                      </a>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
