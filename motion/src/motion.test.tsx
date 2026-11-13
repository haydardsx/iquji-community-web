import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  IqujiMotion,
  IqujiMotionProvider,
  iqujiMotionVariants,
} from "./index.js";

test("路由内容首帧可见且保留窄幅进场位移", () => {
  const markup = renderToStaticMarkup(
    <IqujiMotionProvider>
      <IqujiMotion.div
        initial="initial"
        animate="enter"
        variants={iqujiMotionVariants.route}
      >
        内容
      </IqujiMotion.div>
    </IqujiMotionProvider>,
  );
  const rendered = new DOMParser()
    .parseFromString(markup, "text/html")
    .querySelector("div");
  expect(rendered?.textContent).toBe("内容");
  expect(rendered?.style.opacity).toBe("1");
  expect(iqujiMotionVariants.route.initial.y).toBeLessThanOrEqual(4);
});
