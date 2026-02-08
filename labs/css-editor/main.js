const state = {
  tool: "select",
  elements: [],
  selectedIds: [],
  view: {
    zoom: 1,
    panX: 0,
    panY: 0,
    background: "#fefefe",
    perspective: 1000,
    grid: true,
    mode: "editor", // "editor" or "preview"
  },
  code: {
    html: "",
    css: "",
    js: "",
    userCss: "",
    userJs: "",
    htmlEdited: false,
  },
  history: { past: [], future: [] },
};

const dom = {
  scene: document.getElementById("scene"),
  canvasWrap: document.getElementById("canvasWrap"),
  zoom100: document.getElementById("zoom100"),
  zoomFit: document.getElementById("zoomFit"),
  inspectorContent: document.getElementById("inspectorContent"),
  htmlEditor: document.getElementById("htmlEditor"),
  cssEditor: document.getElementById("cssEditor"),
  jsEditor: document.getElementById("jsEditor"),
  htmlWarning: document.getElementById("htmlWarning"),
  exportModal: document.getElementById("exportModal"),
  exportHtml: document.getElementById("exportHtml"),
  exportJs: document.getElementById("exportJs"),
  layerList: document.getElementById("layerList"),
  modeToggle: document.getElementById("modeToggle"),
  canvasTitle: document.querySelector(".canvas-title"),
};

const markers = {
  css: "/* User CSS */",
  js: "// User JS",
};

const selection = {
  dragging: null,
  rotating: null,
  resizing: null,
  panning: null,
  spaceDown: false,
};

const cm = {
  html: null,
  css: null,
  js: null,
};

let codeUpdateRaf = null;

const eventBindings = new Map();

let clipboard = null;

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const uid = () => Math.random().toString(36).slice(2, 9);

const sanitizeName = (name) => {
  if (!name) return "element";
  // Remove special chars, spaces to hyphens, ensure starts with letter
  return name.trim().replace(/[^a-z0-9_-]/gi, "-").replace(/^[^a-z]+/i, "el-$&").toLowerCase();
};

const defaultElement = (type, x, y) => {
  if (type === "rect") {
    return {
      id: uid(),
      type,
      name: "Rectangle",
      content: "",
      transform: { x, y, z: 0, rotX: 0, rotY: 0, rotZ: 0, scaleX: 1, scaleY: 1 },
      size: { w: 120, h: 120 },
      style: {
        background: "#dddddd",
        color: "#111111",
        opacity: 1,
        borderRadius: "0px",
        borderWidth: 1,
        borderColor: "#cbd5f5",
        borderStyle: "solid",
        boxShadow: { x: 0, y: 0, blur: 0, spread: 0, color: "rgba(0,0,0,0)" },
        padding: "8px",
        margin: "0px",
        transition: { enabled: false, property: "all", duration: "200ms", timingFunction: "ease", delay: "0ms" },
        transformOrigin: "center",
        transformOriginCustom: { x: "50%", y: "50%" },
      },
      events: {
        onClick: { type: "none", payload: "" },
        onHover: { type: "none", payload: "" },
      },
      animations: [],
      zIndex: 1,
      children: [],
    };
  }

  return {
    id: uid(),
    type,
    name: "Text",
    content: "Text",
    transform: { x, y, z: 0, rotX: 0, rotY: 0, rotZ: 0, scaleX: 1, scaleY: 1 },
    size: { w: 140, h: 40 },
    style: {
      background: "transparent",
      color: "#111111",
      opacity: 1,
      borderRadius: "0px",
      borderWidth: 0,
      borderColor: "#111111",
      borderStyle: "solid",
      boxShadow: { x: 0, y: 0, blur: 0, spread: 0, color: "rgba(15,23,42,0)" },
      padding: "4px",
      margin: "0px",
      transition: { enabled: false, property: "all", duration: "200ms", timingFunction: "ease", delay: "0ms" },
      transformOrigin: "center",
      transformOriginCustom: { x: "50%", y: "50%" },
    },
    events: {
      onClick: { type: "none", payload: "" },
      onHover: { type: "none", payload: "" },
    },
    animations: [],
    zIndex: 1,
    children: [],
  };
};

const saveState = () => {
  const payload = {
    elements: state.elements,
    selectedIds: state.selectedIds,
    view: state.view,
    code: {
      userCss: state.code.userCss,
      userJs: state.code.userJs,
      htmlEdited: state.code.htmlEdited,
      html: state.code.htmlEdited ? cm.html?.getValue() : "",
    },
  };
  localStorage.setItem("cve_state", JSON.stringify(payload));
};

const loadState = () => {
  const raw = localStorage.getItem("cve_state");
  if (!raw) return;
  try {
    const payload = JSON.parse(raw);
    state.elements = payload.elements || [];
    state.selectedIds = payload.selectedIds || [];
    state.view = { ...state.view, ...(payload.view || {}) };
    state.code.userCss = payload.code?.userCss || "";
    state.code.userJs = payload.code?.userJs || "";
    state.code.htmlEdited = payload.code?.htmlEdited || false;
    if (payload.code?.html) {
      state.code.html = payload.code.html;
    }
  } catch (err) {
    console.warn("Failed to load state", err);
  }
};

const pushHistory = () => {
  state.history.past.push(JSON.stringify(state.elements));
  if (state.history.past.length > 50) state.history.past.shift();
  state.history.future = [];
};

const undo = () => {
  if (!state.history.past.length) return;
  state.history.future.push(JSON.stringify(state.elements));
  const prev = state.history.past.pop();
  state.elements = JSON.parse(prev);
  state.selectedIds = state.elements[0] ? [state.elements[0].id] : [];
  render();
};

const redo = () => {
  if (!state.history.future.length) return;
  state.history.past.push(JSON.stringify(state.elements));
  const next = state.history.future.pop();
  state.elements = JSON.parse(next);
  state.selectedIds = state.elements[0] ? [state.elements[0].id] : [];
  render();
};

const getSelected = () => {
  const findInTree = (items, id) => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children?.length) {
        const found = findInTree(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  return state.selectedIds.length === 1 ? findInTree(state.elements, state.selectedIds[0]) : null;
};

const getSelectedAll = () => {
  const found = [];
  const findInTree = (items, ids) => {
    items.forEach((item) => {
      if (ids.includes(item.id)) found.push(item);
      if (item.children?.length) findInTree(item.children, ids);
    });
  };
  findInTree(state.elements, state.selectedIds);
  return found;
};

const duplicateElement = (id, offset = 10) => {
  const el = state.elements.find((e) => e.id === id);
  if (!el) return null;
  const clone = JSON.parse(JSON.stringify(el));
  clone.id = uid();
  clone.name = `${el.name} (Copy)`;
  clone.transform.x += offset;
  clone.transform.y += offset;
  state.elements.push(clone);
  state.selectedIds = [clone.id];
  pushHistory();
  render();
  return clone;
};

const groupElements = () => {
  const selected = getSelectedAll();
  if (selected.length < 2) return;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  selected.forEach(el => {
    minX = Math.min(minX, el.transform.x);
    minY = Math.min(minY, el.transform.y);
    maxX = Math.max(maxX, el.transform.x + el.size.w);
    maxY = Math.max(maxY, el.transform.y + el.size.h);
  });

  const group = {
    id: uid(),
    type: "group",
    name: "Group",
    transform: { x: minX, y: minY, z: 0, rotX: 0, rotY: 0, rotZ: 0, scaleX: 1, scaleY: 1 },
    size: { w: maxX - minX, h: maxY - minY },
    style: {
      background: "transparent",
      opacity: 1,
      borderRadius: "0px",
      borderWidth: 0,
      borderColor: "transparent",
      borderStyle: "none",
      boxShadow: { x: 0, y: 0, blur: 0, spread: 0, color: "transparent" },
      padding: "0px",
      margin: "0px",
      transition: { enabled: false, property: "all", duration: "200ms", timingFunction: "ease", delay: "0ms" },
    },
    events: {
      onClick: { type: "none", payload: "" },
      onHover: { type: "none", payload: "" },
    },
    animations: [],
    zIndex: Math.max(...selected.map(el => el.zIndex)),
    children: selected.map(el => {
      const clone = JSON.parse(JSON.stringify(el));
      clone.transform.x -= minX;
      clone.transform.y -= minY;
      return clone;
    })
  };

  const selectedIds = selected.map(el => el.id);
  state.elements = state.elements.filter(el => !selectedIds.includes(el.id));
  state.elements.push(group);
  state.selectedIds = [group.id];
  pushHistory();
  render();
};

const setTool = (tool) => {
  state.tool = tool;
  document.querySelectorAll(".tool-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tool === tool);
  });
};

const renderElements = () => {
  dom.scene.innerHTML = "";
  dom.scene.style.backgroundColor = state.view.background;
  dom.scene.style.backgroundImage = (state.view.grid && state.view.mode !== "preview")
    ? "radial-gradient(#dfe4f0 1px, transparent 1px)"
    : "none";
  dom.scene.style.backgroundSize = "20px 20px";
  dom.scene.style.perspective = `${state.view.perspective}px`;

  const drawTree = (items, container) => {
    items.forEach((el) => {
      const node = document.createElement("div");
      node.className = `canvas-element el el-${el.id} type-${el.type}`;
      node.id = sanitizeName(el.name);
      node.dataset.id = el.id;
      node.style.width = el.type === "group" ? "auto" : `${el.size.w}px`;
      node.style.height = el.type === "group" ? "auto" : `${el.size.h}px`;
      node.style.zIndex = el.zIndex;
      node.style.opacity = el.style.opacity;
      node.style.background = el.style.background;
      node.style.color = el.style.color;
      node.style.borderRadius = el.style.borderRadius;
      node.style.borderWidth = `${el.style.borderWidth}px`;
      node.style.borderColor = el.style.borderColor;
      node.style.borderStyle = el.style.borderStyle;
      node.style.padding = el.style.padding;
      node.style.margin = el.style.margin;
      node.style.boxShadow = `${el.style.boxShadow.x}px ${el.style.boxShadow.y}px ${el.style.boxShadow.blur}px ${el.style.boxShadow.spread}px ${el.style.boxShadow.color}`;

      if (el.type === "text") {
        node.textContent = el.content;
        node.style.fontSize = "20px";
        node.style.display = "flex";
        node.style.alignItems = "center";
        node.style.justifyContent = "flex-start";
      }

      const transform = `translate3d(${el.transform.x}px, ${el.transform.y}px, ${el.transform.z}px) rotateX(${el.transform.rotX}deg) rotateY(${el.transform.rotY}deg) rotateZ(${el.transform.rotZ}deg) scale(${el.transform.scaleX}, ${el.transform.scaleY})`;
      node.style.transform = transform;

      if (el.style.transformOrigin === "custom") {
        node.style.transformOrigin = `${el.style.transformOriginCustom.x} ${el.style.transformOriginCustom.y}`;
      } else {
        node.style.transformOrigin = el.style.transformOrigin || "center";
      }

      if (el.style.transition.enabled && state.view.mode === "preview") {
        node.style.transition = `${el.style.transition.property} ${el.style.transition.duration} ${el.style.transition.timingFunction} ${el.style.transition.delay}`;
      } else {
        node.style.transition = "none";
      }

      if (state.selectedIds.includes(el.id) && state.view.mode === "editor") {
        node.classList.add("selected");
        if (state.selectedIds.length === 1 && el.type !== "group") {
          const rotate = document.createElement("div");
          rotate.className = "handle rotate";
          rotate.dataset.handle = "rotate";
          node.appendChild(rotate);

          const resize = document.createElement("div");
          resize.className = "handle resize";
          resize.dataset.handle = "resize";
          node.appendChild(resize);
        }
      }

      if (el.children && el.children.length) {
        drawTree(el.children, node);
      }

      container.appendChild(node);
    });
  };

  drawTree(state.elements, dom.scene);
};

const updateZoomIndicator = () => {
  if (dom.zoom100) {
    dom.zoom100.textContent = Math.round(state.view.zoom * 100) + "%";
  }
};

const applyViewTransform = () => {
  dom.scene.style.transform = `translate(${state.view.panX}px, ${state.view.panY}px) scale(${state.view.zoom})`;
  updateZoomIndicator();
};

const renderInspector = () => {
  const selected = getSelected();
  const selectedCount = state.selectedIds.length;
  const activeElement = document.activeElement;
  const activeBind = activeElement?.dataset?.bind;
  const selectionStart = activeElement?.selectionStart;
  const selectionEnd = activeElement?.selectionEnd;

  if (selectedCount > 1) {
    dom.inspectorContent.innerHTML = `
      <div class="section">
        <h4>Selection</h4>
        <p style="font-size: 11px; color: var(--muted); margin-bottom: 12px;">${selectedCount} elements selected</p>
        <button class="primary-btn" style="width: 100%; justify-content: center;" data-action="group">
          <span class="material-symbols-outlined" style="font-size: 16px;">workspaces</span>
          Group Elements
        </button>
      </div>
    `;
    bindInspectorInputs(null);
    restoreFocus(activeBind, selectionStart, selectionEnd);
    return;
  }

  if (!selected) {
    dom.inspectorContent.innerHTML = `
      <div class="section">
        <h4>Canvas</h4>
        <div class="field">
          <label>Background</label>
          <input data-bind="view.background" type="text" value="${state.view.background}">
        </div>
        <div class="field">
          <label>Perspective</label>
          <input data-bind="view.perspective" type="number" value="${state.view.perspective}">
        </div>
        <div class="row-inline">
          <input data-bind="view.grid" type="checkbox" ${state.view.grid ? "checked" : ""}>
          <label>Show grid</label>
        </div>
      </div>
    `;
    bindInspectorInputs(null);
    restoreFocus(activeBind, selectionStart, selectionEnd);
    return;
  }

  const circleButton = selected.type === "rect" ? `<button class="ghost-btn" data-action="circle">Circle</button>` : "";

  dom.inspectorContent.innerHTML = `
    <div class="section">
      <h4>Identity</h4>
      <div class="field">
        <label>Name</label>
        <input data-bind="name" type="text" value="${selected.name}">
      </div>
      ${selected.type === "text" ? `
        <div class="field">
          <label>Content</label>
          <input data-bind="content" type="text" value="${selected.content}">
        </div>
      ` : ""}
    </div>
    <div class="section">
      <h4>Transform</h4>
      <div class="field-row-3">
        <div class="field"><label>X</label><input data-bind="transform.x" type="number" value="${selected.transform.x}"></div>
        <div class="field"><label>Y</label><input data-bind="transform.y" type="number" value="${selected.transform.y}"></div>
        <div class="field"><label>Z</label><input data-bind="transform.z" type="number" value="${selected.transform.z}"></div>
      </div>
      <div class="field-row-3">
        <div class="field"><label>rX</label><input data-bind="transform.rotX" type="number" value="${selected.transform.rotX}"></div>
        <div class="field"><label>rY</label><input data-bind="transform.rotY" type="number" value="${selected.transform.rotY}"></div>
        <div class="field"><label>rZ</label><input data-bind="transform.rotZ" type="number" value="${selected.transform.rotZ}"></div>
      </div>
    </div>
    <div class="section">
      <h4>AnchorPoint</h4>
      <div class="field">
        <label>Preset</label>
        <select data-bind="style.transformOrigin">
          ${[
      "center", "top", "right", "bottom", "left",
      "top left", "top right", "bottom left", "bottom right",
      "custom"
    ].map(opt => `<option ${selected.style.transformOrigin === opt ? "selected" : ""} value="${opt}">${opt}</option>`).join("")}
        </select>
      </div>
      ${selected.style.transformOrigin === "custom" ? `
        <div class="field-row">
          <div class="field"><label>X</label><input data-bind="style.transformOriginCustom.x" type="text" value="${selected.style.transformOriginCustom.x}"></div>
          <div class="field"><label>Y</label><input data-bind="style.transformOriginCustom.y" type="text" value="${selected.style.transformOriginCustom.y}"></div>
        </div>
      ` : ""}
    </div>
    <div class="section">
      <h4>Properties</h4>
      <div class="field-row">
        <div class="field"><label>W</label><input data-bind="size.w" type="number" value="${selected.size.w}"></div>
        <div class="field"><label>H</label><input data-bind="size.h" type="number" value="${selected.size.h}"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Z-In</label><input data-bind="zIndex" type="number" value="${selected.zIndex}"></div>
        <div class="field"><label>Opa</label><input data-bind="style.opacity" type="number" step="0.05" value="${selected.style.opacity}"></div>
      </div>
      <div class="field"><label>Rad</label><input data-bind="style.borderRadius" type="text" value="${selected.style.borderRadius}"></div>
      ${circleButton}
    </div>
    <div class="section">
      <h4>Appearance</h4>
      <div class="field"><label>Background</label><input data-bind="style.background" type="text" value="${selected.style.background}"></div>
      <div class="field"><label>Text Color</label><input data-bind="style.color" type="text" value="${selected.style.color}"></div>
    </div>
    <div class="section">
      <h4>Border</h4>
      <div class="field-row">
        <div class="field"><label>Width</label><input data-bind="style.borderWidth" type="number" value="${selected.style.borderWidth}"></div>
        <div class="field"><label>Style</label>
          <select data-bind="style.borderStyle">
            ${["solid", "dashed", "dotted", "none"].map((opt) => `<option ${selected.style.borderStyle === opt ? "selected" : ""} value="${opt}">${opt}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="field"><label>Color</label><input data-bind="style.borderColor" type="text" value="${selected.style.borderColor}"></div>
    </div>
    <div class="section">
      <h4>Shadow</h4>
      <div class="field-row">
        <div class="field"><label>X</label><input data-bind="style.boxShadow.x" type="number" value="${selected.style.boxShadow.x}"></div>
        <div class="field"><label>Y</label><input data-bind="style.boxShadow.y" type="number" value="${selected.style.boxShadow.y}"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Blur</label><input data-bind="style.boxShadow.blur" type="number" value="${selected.style.boxShadow.blur}"></div>
        <div class="field"><label>Spread</label><input data-bind="style.boxShadow.spread" type="number" value="${selected.style.boxShadow.spread}"></div>
      </div>
      <div class="field"><label>Color</label><input data-bind="style.boxShadow.color" type="text" value="${selected.style.boxShadow.color}"></div>
    </div>
    <div class="section">
      <h4>Spacing</h4>
      <div class="field"><label>Padding</label><input data-bind="style.padding" type="text" value="${selected.style.padding}"></div>
      <div class="field"><label>Margin</label><input data-bind="style.margin" type="text" value="${selected.style.margin}"></div>
    </div>
    <div class="section">
      <h4>Transition</h4>
      <div class="row-inline">
        <input data-bind="style.transition.enabled" type="checkbox" ${selected.style.transition.enabled ? "checked" : ""}>
        <label>Enable</label>
      </div>
      <div class="field"><label>Property</label><input data-bind="style.transition.property" type="text" value="${selected.style.transition.property}"></div>
      <div class="field-row">
        <div class="field"><label>Duration</label><input data-bind="style.transition.duration" type="text" value="${selected.style.transition.duration}"></div>
        <div class="field"><label>Delay</label><input data-bind="style.transition.delay" type="text" value="${selected.style.transition.delay}"></div>
      </div>
      <div class="field"><label>Timing</label>
        <select data-bind="style.transition.timingFunction">
          ${["ease", "ease-in", "ease-out", "ease-in-out", "linear", "cubic-bezier(0.4, 0, 0.2, 1)"]
      .map((opt) => `<option ${selected.style.transition.timingFunction === opt ? "selected" : ""} value="${opt}">${opt}</option>`)
      .join("")}
        </select>
      </div>
    </div>
    <div class="section">
      <h4>Events</h4>
      ${renderEventBlock("onClick", selected.events.onClick)}
      ${renderEventBlock("onHover", selected.events.onHover)}
    </div>
    <div class="section">
      <h4>Animations</h4>
      <div class="field">
        <label>Preset</label>
        <select data-bind="animationPreset">
          <option value="fade">Fade In</option>
          <option value="slide">Slide Up</option>
          <option value="pop">Pop</option>
          <option value="rotate">Rotate</option>
        </select>
      </div>
      <div class="row-inline">
        <button class="ghost-btn" data-action="add-animation">Add Animation</button>
        <button class="ghost-btn" data-action="play-animation">Play</button>
        <button class="ghost-btn" data-action="stop-animation">Stop</button>
      </div>
      <div class="field">
        <label>Saved Animations</label>
        <div class="chip">${selected.animations.map((a) => a.preset).join(", ") || "None"}</div>
      </div>
    </div>
  `;

  bindInspectorInputs(selected);
  restoreFocus(activeBind, selectionStart, selectionEnd);
};

const renderLayers = () => {
  if (!dom.layerList) return;
  dom.layerList.innerHTML = "";

  const drawLayers = (items, depth = 0) => {
    items.forEach(el => {
      const item = document.createElement("div");
      item.className = `layer-item ${state.selectedIds.includes(el.id) ? "selected" : ""}`;
      if (depth > 0) item.classList.add("nested");
      item.style.paddingLeft = `${depth * 12 + 10}px`;

      const icon = el.type === "group" ? "📦" : el.type === "rect" ? "▢" : "T";
      item.innerHTML = `<span class="icon">${icon}</span> ${el.name}`;

      item.onclick = (e) => {
        if (e.shiftKey) {
          if (state.selectedIds.includes(el.id)) {
            state.selectedIds = state.selectedIds.filter(id => id !== el.id);
          } else {
            state.selectedIds.push(el.id);
          }
        } else {
          state.selectedIds = [el.id];
        }
        render();
      };

      dom.layerList.appendChild(item);
      if (el.children && el.children.length) {
        drawLayers(el.children, depth + 1);
      }
    });
  };

  drawLayers(state.elements);
};

const restoreFocus = (bind, start, end) => {
  if (!bind) return;
  const input = dom.inspectorContent.querySelector(`[data-bind="${bind}"]`);
  if (input) {
    input.focus();
    if (typeof start === "number" && typeof end === "number") {
      try {
        input.setSelectionRange(start, end);
      } catch (e) {
        // ignore for non-text inputs
      }
    }
  }
};

const renderEventBlock = (label, event) => {
  return `
    <div class="field">
      <label>${label}</label>
      <select data-bind="events.${label}.type">
        ${["none", "toggleClass", "applyStyle", "runJS"]
      .map((opt) => `<option ${event.type === opt ? "selected" : ""} value="${opt}">${opt}</option>`)
      .join("")}
      </select>
    </div>
    <div class="field">
      <label>Payload</label>
      <textarea data-bind="events.${label}.payload">${event.payload || ""}</textarea>
    </div>
  `;
};

const bindInspectorInputs = (selected) => {
  dom.inspectorContent.querySelectorAll("[data-bind]").forEach((input) => {
    const bind = input.dataset.bind;

    input.addEventListener("input", () => {
      const val = input.type === "checkbox" ? input.checked : (input.type === "number" ? Number(input.value) : input.value);

      if (!selected && bind.startsWith("view.")) {
        const key = bind.split(".")[1];
        state.view[key] = val;
        renderElements();
        applyViewTransform();
        updateGeneratedCode();
        return;
      }

      if (!selected) return;
      setByPath(selected, bind, val);

      // Update canvas and code without full inspector re-render to keep focus/cursor
      renderElements();
      updateGeneratedCode();
      applyEvents();
      saveState();
      // We don't call render() here because it would wipe the inspector
    });

    input.addEventListener("change", () => {
      pushHistory();
      render(); // Final sync on blur/change
    });

    input.addEventListener("keydown", (e) => {
      if (input.type !== "number") return;
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      const delta = e.key === "ArrowUp" ? 1 : -1;
      const step = e.shiftKey ? 10 : 1;
      const current = Number(input.value || 0);
      const next = current + delta * step;
      input.value = next;
      input.dispatchEvent(new Event("change"));
    });
  });

  dom.inspectorContent.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      if (action === "group") {
        groupElements();
        return;
      }
      if (!selected) return;
      if (action === "circle") {
        const size = Math.max(selected.size.w, selected.size.h);
        selected.size.w = size;
        selected.size.h = size;
        selected.style.borderRadius = "50%";
      }
      if (action === "add-animation") {
        const preset = dom.inspectorContent.querySelector("[data-bind='animationPreset']").value;
        selected.animations.push({ id: uid(), preset });
      }
      if (action === "play-animation") {
        playAnimation(selected);
      }
      if (action === "stop-animation") {
        gsap.killTweensOf(`.el-${selected.id}`);
      }
      pushHistory();
      render();
    });
  });
};

const setByPath = (obj, path, value) => {
  const parts = path.split(".");
  let cursor = obj;
  parts.forEach((part, idx) => {
    if (idx === parts.length - 1) {
      cursor[part] = value;
    } else {
      cursor = cursor[part];
    }
  });
};

const render = () => {
  renderElements();
  renderInspector();
  renderLayers();
  applyViewTransform();
  updateGeneratedCode();
  applyEvents();

  if (dom.canvasTitle) {
    dom.canvasTitle.textContent = state.view.mode === "preview" ? "Preview" : "Canvas";
  }
  if (dom.modeToggle) {
    dom.modeToggle.checked = state.view.mode === "preview";
    dom.modeToggle.closest(".toggle-group")?.classList.toggle("active", state.view.mode === "preview");
  }

  saveState();
};

const scheduleCodeUpdate = () => {
  if (codeUpdateRaf) return;
  codeUpdateRaf = requestAnimationFrame(() => {
    codeUpdateRaf = null;
    updateGeneratedCode();
  });
};

const getSceneRect = () => dom.scene.getBoundingClientRect();

const clientToCanvas = (clientX, clientY) => {
  const rect = getSceneRect();
  return {
    x: (clientX - rect.left - state.view.panX) / state.view.zoom,
    y: (clientY - rect.top - state.view.panY) / state.view.zoom,
  };
};

const initTools = () => {
  document.querySelectorAll(".tool-btn").forEach((btn) => {
    btn.addEventListener("click", () => setTool(btn.dataset.tool));
  });
};

const initCanvasInteractions = () => {
  dom.canvasWrap.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    const target = e.target;

    if (state.tool === "hand" || selection.spaceDown || state.view.mode === "preview") {
      if (state.view.mode === "preview") return; // Block dragging, but allow hand pan if not blocked by return
      selection.panning = {
        startX: e.clientX,
        startY: e.clientY,
        panX: state.view.panX,
        panY: state.view.panY,
      };
      return;
    }

    if (target.classList.contains("handle")) {
      const id = target.parentElement.dataset.id;
      const element = state.elements.find((el) => el.id === id);
      if (!element) return;
      if (target.dataset.handle === "rotate") {
        const rect = target.parentElement.getBoundingClientRect();
        const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        const angle = Math.atan2(e.clientY - center.y, e.clientX - center.x);
        selection.rotating = { id, center, startAngle: angle, startRot: element.transform.rotZ };
        return;
      }
      if (target.dataset.handle === "resize") {
        selection.resizing = {
          id,
          startX: e.clientX,
          startY: e.clientY,
          width: element.size.w,
          height: element.size.h,
        };
        return;
      }
    }

    if (state.view.mode === "preview") return; // Block selection and other interactions in preview

    const elNode = target.closest(".canvas-element");
    if (elNode) {
      const id = elNode.dataset.id;
      if (state.tool === "select") {
        if (e.shiftKey) {
          if (state.selectedIds.includes(id)) {
            state.selectedIds = state.selectedIds.filter(sid => sid !== id);
          } else {
            state.selectedIds.push(id);
          }
        } else {
          if (!state.selectedIds.includes(id)) {
            state.selectedIds = [id];
          }
        }

        if (e.altKey) {
          const selectedItems = getSelectedAll();
          const clones = selectedItems.map(el => {
            const clone = JSON.parse(JSON.stringify(el));
            clone.id = uid();
            return clone;
          });
          state.elements = state.elements.concat(clones);
          state.selectedIds = clones.map(c => c.id);
          pushHistory();
        }

        const selectedElements = getSelectedAll();
        selection.dragging = selectedElements.map(el => ({
          id: el.id,
          startX: e.clientX,
          startY: e.clientY,
          x: el.transform.x,
          y: el.transform.y
        }));
      }
      render();
      return;
    }

    if (state.tool === "rect" || state.tool === "text") {
      const point = clientToCanvas(e.clientX, e.clientY);
      const newEl = defaultElement(state.tool === "rect" ? "rect" : "text", point.x, point.y);
      pushHistory();
      state.elements.push(newEl);
      state.selectedIds = [newEl.id];
      setTool("select");
      render();
    } else {
      state.selectedIds = [];
      render();
    }
  });

  window.addEventListener("mousemove", (e) => {
    if (selection.dragging) {
      const dx = (e.clientX - selection.dragging[0].startX) / state.view.zoom;
      const dy = (e.clientY - selection.dragging[0].startY) / state.view.zoom;

      selection.dragging.forEach(dragItem => {
        const element = getSelectedAll().find(el => el.id === dragItem.id);
        if (element) {
          element.transform.x = Math.round(dragItem.x + dx);
          element.transform.y = Math.round(dragItem.y + dy);
        }
      });

      renderElements();
      renderInspector();
      applyEvents();
      scheduleCodeUpdate();
      return;
    }

    if (selection.rotating) {
      const element = state.elements.find((el) => el.id === selection.rotating.id);
      if (!element) return;
      const angle = Math.atan2(e.clientY - selection.rotating.center.y, e.clientX - selection.rotating.center.x);
      const delta = ((angle - selection.rotating.startAngle) * 180) / Math.PI;
      element.transform.rotZ = Math.round(selection.rotating.startRot + delta);
      renderElements();
      renderInspector();
      applyEvents();
      scheduleCodeUpdate();
      return;
    }

    if (selection.resizing) {
      const element = state.elements.find((el) => el.id === selection.resizing.id);
      if (!element) return;
      const dx = (e.clientX - selection.resizing.startX) / state.view.zoom;
      const dy = (e.clientY - selection.resizing.startY) / state.view.zoom;
      element.size.w = Math.max(20, Math.round(selection.resizing.width + dx));
      element.size.h = Math.max(20, Math.round(selection.resizing.height + dy));
      renderElements();
      renderInspector();
      applyEvents();
      scheduleCodeUpdate();
      return;
    }

    if (selection.panning) {
      const dx = e.clientX - selection.panning.startX;
      const dy = e.clientY - selection.panning.startY;
      state.view.panX = selection.panning.panX + dx;
      state.view.panY = selection.panning.panY + dy;
      applyViewTransform();
    }
  });

  window.addEventListener("mouseup", () => {
    if (selection.dragging || selection.rotating || selection.resizing) {
      pushHistory();
      saveState();
    }
    selection.dragging = null;
    selection.rotating = null;
    selection.resizing = null;
    selection.panning = null;
  });

  dom.canvasWrap.addEventListener("wheel", (e) => {
    if (!e.ctrlKey && !e.metaKey && state.tool !== "hand") return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const nextZoom = clamp(state.view.zoom + delta, 0.25, 4);
    const rect = getSceneRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const zoomRatio = nextZoom / state.view.zoom;
    state.view.panX = offsetX - zoomRatio * (offsetX - state.view.panX);
    state.view.panY = offsetY - zoomRatio * (offsetY - state.view.panY);
    state.view.zoom = nextZoom;
    applyViewTransform();
  }, { passive: false });

  document.getElementById("zoomIn").addEventListener("click", () => {
    state.view.zoom = clamp(state.view.zoom + 0.1, 0.25, 4);
    applyViewTransform();
  });

  document.getElementById("zoomOut").addEventListener("click", () => {
    state.view.zoom = clamp(state.view.zoom - 0.1, 0.25, 4);
    applyViewTransform();
  });

  document.getElementById("zoom100").addEventListener("click", () => {
    state.view.zoom = 1;
    state.view.panX = 0;
    state.view.panY = 0;
    applyViewTransform();
  });

  document.getElementById("zoomFit").addEventListener("click", () => {
    if (!state.elements.length) {
      state.view.zoom = 1;
      state.view.panX = 0;
      state.view.panY = 0;
      applyViewTransform();
      return;
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    state.elements.forEach((el) => {
      minX = Math.min(minX, el.transform.x);
      minY = Math.min(minY, el.transform.y);
      maxX = Math.max(maxX, el.transform.x + el.size.w);
      maxY = Math.max(maxY, el.transform.y + el.size.h);
    });
    const width = maxX - minX;
    const height = maxY - minY;
    const wrapRect = dom.canvasWrap.getBoundingClientRect();
    const padding = 60;
    const scaleX = (wrapRect.width - padding) / width;
    const scaleY = (wrapRect.height - padding) / height;
    state.view.zoom = clamp(Math.min(scaleX, scaleY), 0.1, 2);
    state.view.panX = (wrapRect.width / 2) - (minX + width / 2) * state.view.zoom;
    state.view.panY = (wrapRect.height / 2) - (minY + height / 2) * state.view.zoom;
    applyViewTransform();
  });
};

const initKeyboard = () => {
  window.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea")) return;

    if (e.key.toLowerCase() === "v") setTool("select");
    if (e.key.toLowerCase() === "r") setTool("rect");
    if (e.key.toLowerCase() === "t") setTool("text");
    if (e.key.toLowerCase() === "z") setTool("hand");
    if (e.code === "Space") selection.spaceDown = true;

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
      e.preventDefault();
      if (state.selectedIds.length === 1) duplicateElement(state.selectedIds[0]);
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "g") {
      e.preventDefault();
      groupElements();
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c") {
      if (state.selectedIds.length === 1) {
        clipboard = JSON.parse(JSON.stringify(getSelected()));
      }
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") {
      if (clipboard) {
        const clone = JSON.parse(JSON.stringify(clipboard));
        clone.id = uid();
        clone.transform.x += 20;
        clone.transform.y += 20;
        state.elements.push(clone);
        state.selectedIds = [clone.id];
        pushHistory();
        render();
      }
    }

    if ((e.key === "Delete" || e.key === "Backspace") && state.selectedIds.length > 0) {
      pushHistory();
      const deleteInItems = (items) => {
        return items.filter(el => {
          if (state.selectedIds.includes(el.id)) return false;
          if (el.children?.length) el.children = deleteInItems(el.children);
          return true;
        });
      };
      state.elements = deleteInItems(state.elements);
      state.selectedIds = [];
      render();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "Space") selection.spaceDown = false;
  });
};

const generateCodeFromModel = (focusId = null) => {
  const getElementsForCode = (items, id) => {
    if (!id) return items;
    for (const item of items) {
      if (item.id === id) return [item];
      if (item.children?.length) {
        const found = getElementsForCode(item.children, id);
        if (found.length) return found;
      }
    }
    return [];
  };

  const elements = getElementsForCode(state.elements, focusId);

  const renderHtmlTree = (items, indent = "  ") => {
    return items.map(el => {
      const content = el.type === "text" ? el.content : "";
      const childrenHtml = el.children?.length ? `\n${renderHtmlTree(el.children, indent + "  ")}\n${indent}` : "";
      const idStr = sanitizeName(el.name);
      return `${indent}<div id="${idStr}" class="el">${content}${childrenHtml}</div>`;
    }).join("\n");
  };

  const renderCssTree = (items) => {
    return items.map(el => {
      const transform = `translate3d(${el.transform.x}px, ${el.transform.y}px, ${el.transform.z}px) rotateX(${el.transform.rotX}deg) rotateY(${el.transform.rotY}deg) rotateZ(${el.transform.rotZ}deg) scale(${el.transform.scaleX}, ${el.transform.scaleY})`;
      const shadow = `${el.style.boxShadow.x}px ${el.style.boxShadow.y}px ${el.style.boxShadow.blur}px ${el.style.boxShadow.spread}px ${el.style.boxShadow.color}`;
      const transition = el.style.transition.enabled
        ? `transition: ${el.style.transition.property} ${el.style.transition.duration} ${el.style.transition.timingFunction} ${el.style.transition.delay};`
        : "";

      const origin = el.style.transformOrigin === "custom"
        ? `${el.style.transformOriginCustom.x} ${el.style.transformOriginCustom.y}`
        : (el.style.transformOrigin || "center");

      let css = `#${sanitizeName(el.name)} {\n  width: ${el.type === "group" ? "auto" : el.size.w + "px"};\n  height: ${el.type === "group" ? "auto" : el.size.h + "px"};\n  z-index: ${el.zIndex};\n  background: ${el.style.background};\n  color: ${el.style.color};\n  opacity: ${el.style.opacity};\n  border-radius: ${el.style.borderRadius};\n  border: ${el.style.borderWidth}px ${el.style.borderStyle} ${el.style.borderColor};\n  box-shadow: ${shadow};\n  padding: ${el.style.padding};\n  margin: ${el.style.margin};\n  transform: ${transform};\n  transform-origin: ${origin};\n  ${transition}\n}`;

      if (el.children?.length) {
        css += `\n\n${renderCssTree(el.children)}`;
      }
      return css;
    }).join("\n\n");
  };

  const html = `<div id="scene">\n${renderHtmlTree(elements)}\n</div>`;
  const baseCss = `#scene {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  perspective: ${state.view.perspective}px;\n}\n.el {\n  position: absolute;\n  transform-style: preserve-3d;\n}`;
  const elementCss = renderCssTree(elements);
  const css = focusId ? elementCss : `${baseCss}\n\n${elementCss}`;
  const js = generateEventJS(focusId);

  return { html, css, js };
};

const generateEventJS = (focusId = null) => {
  const getFlatElements = (items) => {
    let flat = [];
    items.forEach(el => {
      flat.push(el);
      if (el.children?.length) flat = flat.concat(getFlatElements(el.children));
    });
    return flat;
  };

  const allElements = getFlatElements(state.elements);
  const elements = focusId ? allElements.filter((el) => el.id === focusId) : allElements;
  const eventLines = [];
  if (!focusId) {
    eventLines.push("const applyInlineStyle = (el, styleText) => {\n  if (!styleText) return;\n  el.style.cssText += ';' + styleText;\n};\n");
  }
  elements.forEach((el) => {
    if (el.events.onClick.type !== "none") {
      eventLines.push(renderEventHandler(el, "click", el.events.onClick));
    }
    if (el.events.onHover.type !== "none") {
      eventLines.push(renderEventHandler(el, "mouseenter", el.events.onHover));
    }
  });

  if (!elements.some((el) => el.animations.length)) {
    return eventLines.join("\n");
  }

  const animLines = elements
    .map((el) => {
      if (!el.animations.length) return "";
      return `// Animations for ${el.id}\n${el.animations
        .map((anim, idx) => `// Preset ${idx + 1}: ${anim.preset}`)
        .join("\n")}`;
    })
    .join("\n");

  return `${eventLines.join("\n")}\n${animLines}`;
};

const getExportFiles = () => {
  const { html, css, js } = generateCodeFromModel();
  const fullHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CSS Visual Editor Export</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    ${html}
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="script.js"></script>
  </body>
</html>`;

  const fullCss = `${css}\n\n${state.code.userCss || ""}`;
  const fullJs = `${js}\n\n${state.code.userJs || ""}`;
  return { html: fullHtml, css: fullCss, js: fullJs };
};

const renderEventHandler = (el, domEvent, event) => {
  const selector = `#${sanitizeName(el.name)}`;
  if (event.type === "toggleClass") {
    return `document.querySelector('${selector}')?.addEventListener('${domEvent}', (e) => {\n  e.currentTarget.classList.toggle('${event.payload || "is-active"}');\n});`;
  }
  if (event.type === "applyStyle") {
    return `document.querySelector('${selector}')?.addEventListener('${domEvent}', (e) => {\n  applyInlineStyle(e.currentTarget, \`${event.payload || ""}\`);\n});`;
  }
  if (event.type === "runJS") {
    return `document.querySelector('${selector}')?.addEventListener('${domEvent}', (e) => {\n  ${event.payload || ""}\n});`;
  }
  return "";
};

const splitUserSection = (source, marker) => {
  if (!source.includes(marker)) return { visual: source, user: "" };
  const [visual, ...rest] = source.split(marker);
  return { visual, user: rest.join(marker).trim() };
};

const updateGeneratedCode = () => {
  if (!cm.html || !cm.css || !cm.js) return;
  const focusId = state.selectedIds.length === 1 ? state.selectedIds[0] : null;
  const { html, css, js } = generateCodeFromModel(focusId);
  state.code.html = html;
  state.code.css = css;
  state.code.js = js;

  if (!state.code.htmlEdited) {
    cm.html.setValue(html);
  }

  const cssBundle = `${css}\n\n${markers.css}\n${state.code.userCss || ""}`;
  cm.css.setValue(cssBundle);

  const jsBundle = `${js}\n\n${markers.js}\n${state.code.userJs || ""}`;
  cm.js.setValue(jsBundle);

  cm.html.refresh();
  cm.css.refresh();
  cm.js.refresh();

  applyGeneratedStyles(cssBundle);
};

const applyGeneratedStyles = (cssText) => {
  let styleTag = document.getElementById("generatedStyles");
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "generatedStyles";
    document.head.appendChild(styleTag);
  }
  styleTag.textContent = cssText;
};

const initEditors = () => {
  if (!window.CodeMirror) {
    console.warn("CodeMirror not found. Editors will not be available.");
    return;
  }
  cm.html = window.CodeMirror.fromTextArea(dom.htmlEditor, {
    mode: "xml",
    theme: "material-darker",
    lineNumbers: true,
  });
  cm.css = window.CodeMirror.fromTextArea(dom.cssEditor, {
    mode: "css",
    theme: "material-darker",
    lineNumbers: true,
  });
  cm.js = window.CodeMirror.fromTextArea(dom.jsEditor, {
    mode: "javascript",
    theme: "material-darker",
    lineNumbers: true,
  });

  cm.html.on("change", (it, change) => {
    if (change.origin === "setValue") return;
    state.code.htmlEdited = true;
    dom.htmlWarning.classList.add("show");
    state.code.html = cm.html.getValue();
    saveState();
  });

  cm.css.on("change", (it, change) => {
    if (change.origin === "setValue") return;
    const value = cm.css.getValue();
    const { user } = splitUserSection(value, markers.css);
    state.code.userCss = user;
    applyGeneratedStyles(value);
    saveState();
  });

  cm.js.on("change", (it, change) => {
    if (change.origin === "setValue") return;
    const value = cm.js.getValue();
    const { user } = splitUserSection(value, markers.js);
    state.code.userJs = user;
    saveState();
  });
};

const applyEvents = () => {
  eventBindings.forEach((binding) => {
    const el = document.querySelector(binding.selector);
    if (el) el.removeEventListener(binding.event, binding.handler);
  });
  eventBindings.clear();

  if (state.view.mode !== "preview") return;

  const bindRecursive = (items) => {
    items.forEach((el) => {
      [
        { event: "click", config: el.events.onClick },
        { event: "mouseenter", config: el.events.onHover },
      ].forEach(({ event, config }) => {
        if (!config || config.type === "none") return;
        const selector = `#${sanitizeName(el.name)}`;
        const node = document.querySelector(selector);
        if (!node) return;

        const handler = (e) => {
          if (config.type === "toggleClass") {
            node.classList.toggle(config.payload || "is-active");
          }
          if (config.type === "applyStyle") {
            node.style.cssText += ";" + (config.payload || "");
          }
          if (config.type === "runJS") {
            try {
              const fn = new Function("event", config.payload || "");
              fn(e);
            } catch (err) {
              console.warn("User JS error", err);
            }
          }
        };

        if (event === "mouseenter") {
          const leaveHandler = (e) => {
            render(); // Simplest way to reset styles is to re-render
          };
          node.addEventListener("mouseleave", leaveHandler);
          eventBindings.set(`${el.id}-mouseleave`, { selector, event: "mouseleave", handler: leaveHandler });
        }

        node.addEventListener(event, handler);
        eventBindings.set(`${el.id}-${event}`, { selector, event, handler });
      });

      if (el.children && el.children.length) {
        bindRecursive(el.children);
      }
    });
  };

  bindRecursive(state.elements);
};

const playAnimation = (el, recursive = true) => {
  const gs = window.gsap;
  if (!gs) {
    console.warn("GSAP not found. Animations will not play.");
    return;
  }
  if (!el) return;

  const selector = `#${sanitizeName(el.name)}`;
  const node = document.querySelector(selector);

  if (node && el.animations.length) {
    gs.killTweensOf(node);
    el.animations.forEach((anim) => {
      if (anim.preset === "fade") {
        gs.fromTo(node, { opacity: 0 }, { opacity: el.style.opacity, duration: 0.6, ease: "power2.out" });
      }
      if (anim.preset === "slide") {
        gs.fromTo(node, { y: 20 }, { y: 0, duration: 0.6, ease: "power2.out" });
      }
      if (anim.preset === "pop") {
        gs.fromTo(node, { scale: 0.8 }, { scale: 1, duration: 0.5, ease: "back.out(1.7)" });
      }
      if (anim.preset === "rotate") {
        gs.fromTo(node, { rotation: -10 }, { rotation: 0, duration: 0.6, ease: "power2.out" });
      }
    });
  }

  if (recursive && el.children && el.children.length) {
    el.children.forEach(child => playAnimation(child, true));
  }
};


const safeAddEventListener = (id, event, handler) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener(event, handler);
  } else {
    console.warn(`Element with id "${id}" not found.`);
  }
};

const initTopActions = () => {
  safeAddEventListener("undoBtn", "click", undo);
  safeAddEventListener("redoBtn", "click", redo);

  safeAddEventListener("regenBtn", "click", () => {
    state.code.htmlEdited = false;
    if (dom.htmlWarning) dom.htmlWarning.classList.remove("show");
    render();
  });

  safeAddEventListener("runJsBtn", "click", () => {
    try {
      if (!cm.js) return;
      const jsText = cm.js.getValue();
      const { visual, user } = splitUserSection(jsText, markers.js);
      const runner = new Function("scene", "elements", "gsap", `${visual}\n${user}`);
      runner(dom.scene, state.elements, window.gsap);
    } catch (err) {
      console.warn("JS run error", err);
    }
  });


  safeAddEventListener("exportBtn", "click", () => {
    const { html, css, js } = getExportFiles();
    if (dom.exportHtml) dom.exportHtml.textContent = html;
    if (dom.exportCss) dom.exportCss.textContent = css;
    if (dom.exportJs) dom.exportJs.textContent = js;
    if (dom.exportModal) dom.exportModal.classList.remove("hidden");
  });

  safeAddEventListener("closeExport", "click", () => {
    if (dom.exportModal) dom.exportModal.classList.add("hidden");
  });

  if (dom.exportModal) {
    dom.exportModal.addEventListener("click", (e) => {
      if (e.target === dom.exportModal) dom.exportModal.classList.add("hidden");
    });
  }

  document.querySelectorAll("[data-download]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.download;
      const { html, css, js } = getExportFiles();
      const content = type === "html" ? html : type === "css" ? css : js;
      const blob = new Blob([content], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = type === "html" ? "index.html" : type === "css" ? "styles.css" : "script.js";
      link.click();
      URL.revokeObjectURL(link.href);
    });
  });

  safeAddEventListener("modeToggle", "change", (e) => {
    state.view.mode = e.target.checked ? "preview" : "editor";
    if (state.view.mode === "preview") {
      state.selectedIds = [];
      state.elements.forEach(el => playAnimation(el));
    }
    render();
  });
};

const init = () => {
  console.log("Initializing CSS Visual Editor...");

  const start = () => {
    try {
      loadState();
      initTools();
      initCanvasInteractions();
      initKeyboard();
      initEditors();
      initTopActions();

      setTimeout(() => {
        render();
        if (state.code.htmlEdited && state.code.html && cm.html) {
          cm.html.setValue(state.code.html);
          if (dom.htmlWarning) dom.htmlWarning.classList.add("show");
        }
      }, 100);
    } catch (err) {
      console.error("Initialization failed:", err);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
};

init();
