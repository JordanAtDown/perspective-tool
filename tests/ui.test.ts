// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";

const $ = (id: string) => document.getElementById(id)!;
const click = (el: Element | null) => el!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
const pressed = (container: string, value: string) =>
  $(container).querySelector(`button[data-v="${value}"]`)!.getAttribute("aria-pressed");

beforeAll(async () => {
  const html = readFileSync("index.html", "utf8");
  document.body.innerHTML = /<body>([\s\S]*)<\/body>/.exec(html)![1].replace(/<script[\s\S]*?<\/script>/, "");
  await import("../src/main");
});

describe("interface", () => {
  it("dessine la feuille et les poignées au démarrage", () => {
    const svg = $("view");
    expect(svg.querySelectorAll("path").length).toBeGreaterThan(0);
    expect(svg.querySelector('[data-drag="horizon"]')).not.toBeNull();
    expect(svg.querySelector('[data-drag="vp0"]')).not.toBeNull();
    expect(svg.querySelector('[data-drag="vp2"]')).toBeNull(); // 2 points par défaut
  });

  it("affiche les 17 préréglages", () => {
    expect($("presets").querySelectorAll(".preset").length).toBe(17);
  });

  it("applique un préréglage et le marque comme actif", () => {
    const preset = $("presets").querySelector<HTMLElement>('[data-p="contre"]')!;
    click(preset);
    expect(preset.getAttribute("aria-pressed")).toBe("true");
    expect(pressed("mode", "3")).toBe("true");
    expect($("view").querySelector('[data-drag="vp2"]')).not.toBeNull();
    expect(JSON.parse(localStorage.getItem("grille-persp-v1")!).mode).toBe(3);
  });

  it("passe en curviligne : poignées de centre et de rayon, boutons 4-6 points", () => {
    click($("family").querySelector('button[data-v="curv"]'));
    expect($("view").querySelector('[data-drag="center"]')).not.toBeNull();
    expect($("view").querySelector('[data-drag="radius"]')).not.toBeNull();
    const visible = [...$("mode").querySelectorAll("button")].filter((b) => !b.hidden).map((b) => b.dataset.v);
    expect(visible).toEqual(["4", "5", "6"]);
    expect($("modenote").textContent).toContain("Fisheye");
  });

  it("repasse en portrait", () => {
    click($("orient").querySelector('button[data-v="portrait"]'));
    expect(pressed("orient", "portrait")).toBe("true");
    expect($("view").getAttribute("viewBox")).toBeTruthy();
  });

  it("masque un calque et le dit dans l'interface", () => {
    const layer = document.querySelector<HTMLElement>('.layer[data-l="lines"]')!;
    click(layer.querySelector(".eye"));
    expect(layer.classList.contains("off")).toBe(true);
    expect(layer.querySelector(".eye")!.getAttribute("aria-label")).toMatch(/^Afficher/);
  });

  it("règle l'opacité d'un calque dans les bornes 10-100 %", () => {
    const layer = document.querySelector<HTMLElement>('.layer[data-l="hor"]')!;
    const more = layer.querySelector<HTMLButtonElement>('.step[data-d="10"]')!;
    for (let i = 0; i < 10; i++) click(more);
    expect(layer.querySelector(".op")!.textContent).toBe("100 %");
    expect(more.disabled).toBe(true);
  });

  it("le champ d'un point de fuite modifie la scène", () => {
    click($("family").querySelector('button[data-v="lin"]'));
    const input = $("vp0x") as HTMLInputElement;
    input.value = "-250";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(JSON.parse(localStorage.getItem("grille-persp-v1")!).vp[0].x).toBe(-250);
  });
});
