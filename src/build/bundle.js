
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var ui = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (typeof $$scope.dirty === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(html, anchor = null) {
            this.e = element('div');
            this.a = anchor;
            this.u(html);
        }
        m(target, anchor = null) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(target, this.n[i], anchor);
            }
            this.t = target;
        }
        u(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        p(html) {
            this.d();
            this.u(html);
            this.m(this.t, this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (!arg || !('length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css = ":root{--blue:#18a0fb;--purple:#7b61ff;--hot-pink:#f0f;--green:#1bc47d;--red:#f24822;--yellow:#ffeb00;--black:#000;--black8:rgba(0,0,0,0.8);--black8-opaque:#333;--black3:rgba(0,0,0,0.3);--black3-opaque:#b3b3b3;--white:#fff;--white8:hsla(0,0%,100%,0.8);--white4:hsla(0,0%,100%,0.4);--grey:#f0f0f0;--silver:#e5e5e5;--hud:#222;--toolbar:#2c2c2c;--black1:rgba(0,0,0,0.1);--blue3:rgba(24,145,251,0.3);--purple4:rgba(123,97,255,0.4);--hover-fill:rgba(0,0,0,0.06);--selection-a:#daebf7;--selection-b:#edf5fa;--white2:hsla(0,0%,100%,0.2);--font-stack:\"Inter\",sans-serif;--font-size-xsmall:11px;--font-size-small:12px;--font-size-large:13px;--font-size-xlarge:14px;--font-weight-normal:400;--font-weight-medium:500;--font-weight-bold:600;--font-line-height:16px;--font-line-height-large:24px;--font-letter-spacing-pos-xsmall:.005em;--font-letter-spacing-neg-xsmall:.01em;--font-letter-spacing-pos-small:0;--font-letter-spacing-neg-small:.005em;--font-letter-spacing-pos-large:-.0025em;--font-letter-spacing-neg-large:.0025em;--font-letter-spacing-pos-xlarge:-.001em;--font-letter-spacing-neg-xlarge:-.001em;--border-radius-small:2px;--border-radius-med:5px;--border-radius-large:6px;--shadow-hud:0 5px 17px rgba(0,0,0,0.2),0 2px 7px rgba(0,0,0,0.15);--shadow-floating-window:0 2px 14px rgba(0,0,0,0.15);--size-xxsmall:8px;--size-xsmall:16px;--size-small:24px;--size-medium:32px;--size-large:40px;--size-xlarge:48px;--size-xxlarge:64px;--size-huge:80px}*,body{box-sizing:border-box}body{position:relative;font-family:Inter,sans-serif;margin:0;padding:0}@font-face{font-family:Inter;font-weight:400;font-style:normal;src:url(https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.7) format(\"woff2\"),url(https://rsms.me/inter/font-files/Inter-Regular.woff?v=3.7) format(\"woff\")}@font-face{font-family:Inter;font-weight:500;font-style:normal;src:url(https://rsms.me/inter/font-files/Inter-Medium.woff2?v=3.7) format(\"woff2\"),url(https://rsms.me/inter/font-files/Inter-Medium.woff2?v=3.7) format(\"woff\")}@font-face{font-family:Inter;font-weight:600;font-style:normal;src:url(https://rsms.me/inter/font-files/Inter-SemiBold.woff2?v=3.7) format(\"woff2\"),url(https://rsms.me/inter/font-files/Inter-SemiBold.woff2?v=3.7) format(\"woff\")}a{text-decoration:none;cursor:pointer}a,a:active,a:hover{color:var(--blue)}a:focus{text-decoration:underline}.p-xxsmall{padding:var(--size-xxsmall)}.p-xsmall{padding:var(--size-xsmall)}.p-small{padding:var(--size-small)}.p-medium{padding:var(--size-medium)}.p-large{padding:var(--size-large)}.p-xlarge{padding:var(--size-xlarge)}.p-xxlarge{padding:var(--size-xxlarge)}.p-huge{padding:var(--size-huge)}.pt-xxsmall{padding-top:var(--size-xxsmall)}.pt-xsmall{padding-top:var(--size-xsmall)}.pt-small{padding-top:var(--size-small)}.pt-medium{padding-top:var(--size-medium)}.pt-large{padding-top:var(--size-large)}.pt-xlarge{padding-top:var(--size-xlarge)}.pt-xxlarge{padding-top:var(--size-xxlarge)}.pt-huge{padding-top:var(--size-huge)}.pr-xxsmall{padding-right:var(--size-xxsmall)}.pr-xsmall{padding-right:var(--size-xsmall)}.pr-small{padding-right:var(--size-small)}.pr-medium{padding-right:var(--size-medium)}.pr-large{padding-right:var(--size-large)}.pr-xlarge{padding-right:var(--size-xlarge)}.pr-xxlarge{padding-right:var(--size-xxlarge)}.pr-huge{padding-right:var(--size-huge)}.pb-xxsmall{padding-bottom:var(--size-xxsmall)}.pb-xsmall{padding-bottom:var(--size-xsmall)}.pb-small{padding-bottom:var(--size-small)}.pb-medium{padding-bottom:var(--size-medium)}.pb-large{padding-bottom:var(--size-large)}.pb-xlarge{padding-bottom:var(--size-xlarge)}.pb-xxlarge{padding-bottom:var(--size-xxlarge)}.pb-huge{padding-bottom:var(--size-huge)}.pl-xxsmall{padding-left:var(--size-xxsmall)}.pl-xsmall{padding-left:var(--size-xsmall)}.pl-small{padding-left:var(--size-small)}.pl-medium{padding-left:var(--size-medium)}.pl-large{padding-left:var(--size-large)}.pl-xlarge{padding-left:var(--size-xlarge)}.pl-xxlarge{padding-left:var(--size-xxlarge)}.pl-huge{padding-left:var(--size-huge)}.m-xxsmall{margin:var(--size-xxsmall)}.m-xsmall{margin:var(--size-xsmall)}.m-small{margin:var(--size-small)}.m-medium{margin:var(--size-medium)}.m-large{margin:var(--size-large)}.m-xlarge{margin:var(--size-xlarge)}.m-xxlarge{margin:var(--size-xxlarge)}.m-huge{margin:var(--size-huge)}.mt-xxsmall{margin-top:var(--size-xxsmall)}.mt-xsmall{margin-top:var(--size-xsmall)}.mt-small{margin-top:var(--size-small)}.mt-medium{margin-top:var(--size-medium)}.mt-large{margin-top:var(--size-large)}.mt-xlarge{margin-top:var(--size-xlarge)}.mt-xxlarge{margin-top:var(--size-xxlarge)}.mt-huge{margin-top:var(--size-huge)}.mr-xxsmall{margin-right:var(--size-xxsmall)}.mr-xsmall{margin-right:var(--size-xsmall)}.mr-small{margin-right:var(--size-small)}.mr-medium{margin-right:var(--size-medium)}.mr-large{margin-right:var(--size-large)}.mr-xlarge{margin-right:var(--size-xlarge)}.mr-xxlarge{margin-right:var(--size-xxlarge)}.mr-huge{margin-right:var(--size-huge)}.mb-xxsmall{margin-bottom:var(--size-xxsmall)}.mb-xsmall{margin-bottom:var(--size-xsmall)}.mb-small{margin-bottom:var(--size-small)}.mb-medium{margin-bottom:var(--size-medium)}.mb-large{margin-bottom:var(--size-large)}.mb-xlarge{margin-bottom:var(--size-xlarge)}.mb-xxlarge{margin-bottom:var(--size-xxlarge)}.mb-huge{margin-bottom:var(--size-huge)}.ml-xxsmall{margin-left:var(--size-xxsmall)}.ml-xsmall{margin-left:var(--size-xsmall)}.ml-small{margin-left:var(--size-small)}.ml-medium{margin-left:var(--size-medium)}.ml-large{margin-left:var(--size-large)}.ml-xlarge{margin-left:var(--size-xlarge)}.ml-xxlarge{margin-left:var(--size-xxlarge)}.ml-huge{margin-left:var(--size-huge)}.hidden{display:none}.flex{display:flex}.flexwrap{flex-wrap:wrap}.column{flex-direction:column}.row{flex-direction:row}";
    styleInject(css);

    /* node_modules/figma-plugin-ds-svelte/src/components/Button/index.svelte generated by Svelte v3.19.0 */
    const file = "node_modules/figma-plugin-ds-svelte/src/components/Button/index.svelte";

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-8intfl-style";
    	style.textContent = "button.svelte-8intfl{display:flex;align-items:center;border-radius:var(--border-radius-large);color:var(--white);flex-shrink:0;font-family:var(--font-stack);font-size:var(--font-size-xsmall);font-weight:var(--font-weight-medium);letter-spacing:var(--font-letter-spacing-neg-small);line-height:var(--font-line-height);height:var(--size-medium);padding:0 var(--size-xsmall) 0 var(--size-xsmall);text-decoration:none;outline:none;border:2px solid transparent;user-select:none}.primary.svelte-8intfl{background-color:var(--blue);color:var(--white)}.primary.svelte-8intfl:enabled:active,.primary.svelte-8intfl:enabled:focus{border:2px solid var(--black3)}.primary.svelte-8intfl:disabled{background-color:var(--black3)}.primary.destructive.svelte-8intfl{background-color:var(--red)}.primary.destructive.svelte-8intfl:disabled{opacity:0.4}.secondary.svelte-8intfl{background-color:var(--white);border:1px solid var(--black8);color:var(--black8);padding:0 calc(var(--size-xsmall) + 1px) 0 calc(var(--size-xsmall) + 1px);letter-spacing:var(--font-letter-spacing-pos-small)}.secondary.svelte-8intfl:enabled:active,.secondary.svelte-8intfl:enabled:focus{border:2px solid var(--blue);padding:0 var(--size-xsmall) 0 var(--size-xsmall)}.secondary.svelte-8intfl:disabled{border:1px solid var(--black3);color:var(--black3)}.secondary.destructive.svelte-8intfl{border-color:var(--red);color:var(--red)}.secondary.destructive.svelte-8intfl:enabled:active,.secondary.destructive.svelte-8intfl:enabled:focus{border:2px solid var(--red);padding:0 var(--size-xsmall) 0 var(--size-xsmall)}.secondary.destructive.svelte-8intfl:disabled{opacity:0.4}.tertiary.svelte-8intfl{border:1px solid transparent;color:var(--blue);padding:0;font-weight:var(--font-weight-normal);letter-spacing:var(--font-letter-spacing-pos-small);cursor:pointer}.tertiary.svelte-8intfl:enabled:focus{text-decoration:underline}.tertiary.svelte-8intfl:disabled{color:var(--black3)}.tertiary.destructive.svelte-8intfl{color:var(--red)}.tertiary.destructive.svelte-8intfl:enabled:focus{text-decoration:underline}.tertiary.destructive.svelte-8intfl:disabled{opacity:0.4}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguc3ZlbHRlIiwic291cmNlcyI6WyJpbmRleC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgICBpbXBvcnQgeyBvbk1vdW50IH0gZnJvbSAnc3ZlbHRlJztcblxuICAgIGV4cG9ydCBsZXQgdmFyaWFudCA9ICdwcmltYXJ5JztcbiAgICBleHBvcnQgbGV0IGRpc2FibGVkID0gZmFsc2U7XG4gICAgZXhwb3J0IGxldCBkZXN0cnVjdGl2ZSA9IGZhbHNlO1xuICAgIGV4cG9ydCB7IGNsYXNzTmFtZSBhcyBjbGFzcyB9O1xuXG4gICAgbGV0IGNsYXNzTmFtZSA9ICcnO1xuXG48L3NjcmlwdD5cblxuPGJ1dHRvblxuICAgIG9uOmNsaWNrXG4gICAgb246c3VibWl0fHByZXZlbnREZWZhdWx0XG4gICAgb25jbGljaz1cInRoaXMuYmx1cigpO1wiXG4gICAge3ZhcmlhbnR9XG4gICAge2Rpc2FibGVkfVxuICAgIGNsYXNzOmRlc3RydWN0aXZlPXtkZXN0cnVjdGl2ZX1cbiAgICBjbGFzcz1cInt2YXJpYW50fSB7Y2xhc3NOYW1lfVwiPlxuICAgICAgICA8c2xvdCAvPlxuPC9idXR0b24+XG5cbjxzdHlsZT5cblxuICAgIGJ1dHRvbiB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMtbGFyZ2UpO1xuICAgICAgICBjb2xvcjogdmFyKC0td2hpdGUpO1xuICAgICAgICBmbGV4LXNocmluazogMDtcbiAgICAgICAgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtc3RhY2spO1xuICAgICAgICBmb250LXNpemU6IHZhcigtLWZvbnQtc2l6ZS14c21hbGwpO1xuICAgICAgICBmb250LXdlaWdodDogdmFyKC0tZm9udC13ZWlnaHQtbWVkaXVtKTtcbiAgICAgICAgbGV0dGVyLXNwYWNpbmc6IHZhcigtLWZvbnQtbGV0dGVyLXNwYWNpbmctbmVnLXNtYWxsKTtcbiAgICAgICAgbGluZS1oZWlnaHQ6IHZhcigtLWZvbnQtbGluZS1oZWlnaHQpO1xuICAgICAgICBoZWlnaHQ6IHZhcigtLXNpemUtbWVkaXVtKTtcbiAgICAgICAgcGFkZGluZzogMCB2YXIoLS1zaXplLXhzbWFsbCkgMCB2YXIoLS1zaXplLXhzbWFsbCk7XG4gICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICAgICAgb3V0bGluZTogbm9uZTtcbiAgICAgICAgYm9yZGVyOiAycHggc29saWQgdHJhbnNwYXJlbnQ7XG4gICAgICAgIHVzZXItc2VsZWN0OiBub25lO1xuICAgIH1cblxuICAgIC8qIFByaW1hcnkgc3R5bGVzICovXG4gICAgLnByaW1hcnkge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ibHVlKTtcbiAgICAgICAgY29sb3I6IHZhcigtLXdoaXRlKTtcbiAgICB9XG4gICAgLnByaW1hcnk6ZW5hYmxlZDphY3RpdmUsIC5wcmltYXJ5OmVuYWJsZWQ6Zm9jdXMge1xuICAgICAgICBib3JkZXI6IDJweCBzb2xpZCB2YXIoLS1ibGFjazMpO1xuICAgIH1cbiAgICAucHJpbWFyeTpkaXNhYmxlZCB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJsYWNrMyk7XG4gICAgfVxuICAgIC5wcmltYXJ5LmRlc3RydWN0aXZlIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tcmVkKTtcbiAgICB9XG4gICAgLnByaW1hcnkuZGVzdHJ1Y3RpdmU6ZGlzYWJsZWQgIHtcbiAgICAgICAgb3BhY2l0eTogMC40O1xuICAgIH1cblxuICAgIC8qIFNlY29uZGFyeSBzdHlsZXMgKi9cbiAgICAuc2Vjb25kYXJ5IHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0td2hpdGUpO1xuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ibGFjazgpO1xuICAgICAgICBjb2xvcjogdmFyKC0tYmxhY2s4KTtcbiAgICAgICAgcGFkZGluZzogMCBjYWxjKHZhcigtLXNpemUteHNtYWxsKSArIDFweCkgMCBjYWxjKHZhcigtLXNpemUteHNtYWxsKSArIDFweCk7XG4gICAgICAgIGxldHRlci1zcGFjaW5nOiB2YXIoLS1mb250LWxldHRlci1zcGFjaW5nLXBvcy1zbWFsbCk7XG4gICAgfVxuICAgIC5zZWNvbmRhcnk6ZW5hYmxlZDphY3RpdmUsIC5zZWNvbmRhcnk6ZW5hYmxlZDpmb2N1cyB7XG4gICAgICAgIGJvcmRlcjogMnB4IHNvbGlkIHZhcigtLWJsdWUpO1xuICAgICAgICBwYWRkaW5nOiAwIHZhcigtLXNpemUteHNtYWxsKSAwIHZhcigtLXNpemUteHNtYWxsKTtcbiAgICB9XG4gICAgLnNlY29uZGFyeTpkaXNhYmxlZCB7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJsYWNrMyk7XG4gICAgICAgIGNvbG9yOiB2YXIoLS1ibGFjazMpO1xuICAgIH1cbiAgICAuc2Vjb25kYXJ5LmRlc3RydWN0aXZlIHtcbiAgICAgICBib3JkZXItY29sb3I6IHZhcigtLXJlZCk7XG4gICAgICAgY29sb3I6IHZhcigtLXJlZCk7XG4gICAgfVxuICAgIC5zZWNvbmRhcnkuZGVzdHJ1Y3RpdmU6ZW5hYmxlZDphY3RpdmUsIC5zZWNvbmRhcnkuZGVzdHJ1Y3RpdmU6ZW5hYmxlZDpmb2N1cyB7XG4gICAgICAgYm9yZGVyOiAycHggc29saWQgdmFyKC0tcmVkKTtcbiAgICAgICAgcGFkZGluZzogMCB2YXIoLS1zaXplLXhzbWFsbCkgMCB2YXIoLS1zaXplLXhzbWFsbCk7XG4gICAgfVxuICAgIC5zZWNvbmRhcnkuZGVzdHJ1Y3RpdmU6ZGlzYWJsZWQge1xuICAgICAgICBvcGFjaXR5OiAwLjQ7XG4gICAgfVxuXG4gICAgLyogdGVydGlhcnkgc3R5bGVzICovXG4gICAgLnRlcnRpYXJ5IHtcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgdHJhbnNwYXJlbnQ7XG4gICAgICAgIGNvbG9yOiB2YXIoLS1ibHVlKTtcbiAgICAgICAgcGFkZGluZzogMDtcbiAgICAgICAgZm9udC13ZWlnaHQ6IHZhcigtLWZvbnQtd2VpZ2h0LW5vcm1hbCk7XG4gICAgICAgIGxldHRlci1zcGFjaW5nOiB2YXIoLS1mb250LWxldHRlci1zcGFjaW5nLXBvcy1zbWFsbCk7XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICB9XG4gICAgLnRlcnRpYXJ5OmVuYWJsZWQ6Zm9jdXMge1xuICAgICAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcbiAgICB9XG4gICAgLnRlcnRpYXJ5OmRpc2FibGVkIHtcbiAgICAgICAgY29sb3I6IHZhcigtLWJsYWNrMyk7XG4gICAgfVxuICAgIC50ZXJ0aWFyeS5kZXN0cnVjdGl2ZSB7XG4gICAgICAgY29sb3I6IHZhcigtLXJlZCk7XG4gICAgfVxuICAgIC50ZXJ0aWFyeS5kZXN0cnVjdGl2ZTplbmFibGVkOmZvY3VzIHtcbiAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XG4gICAgfVxuICAgIC50ZXJ0aWFyeS5kZXN0cnVjdGl2ZTpkaXNhYmxlZCB7XG4gICAgICAgb3BhY2l0eTogMC40O1xuICAgIH1cblxuPC9zdHlsZT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBeUJJLE1BQU0sY0FBQyxDQUFDLEFBQ0osT0FBTyxDQUFFLElBQUksQ0FDYixXQUFXLENBQUUsTUFBTSxDQUNuQixhQUFhLENBQUUsSUFBSSxxQkFBcUIsQ0FBQyxDQUN6QyxLQUFLLENBQUUsSUFBSSxPQUFPLENBQUMsQ0FDbkIsV0FBVyxDQUFFLENBQUMsQ0FDZCxXQUFXLENBQUUsSUFBSSxZQUFZLENBQUMsQ0FDOUIsU0FBUyxDQUFFLElBQUksa0JBQWtCLENBQUMsQ0FDbEMsV0FBVyxDQUFFLElBQUksb0JBQW9CLENBQUMsQ0FDdEMsY0FBYyxDQUFFLElBQUksK0JBQStCLENBQUMsQ0FDcEQsV0FBVyxDQUFFLElBQUksa0JBQWtCLENBQUMsQ0FDcEMsTUFBTSxDQUFFLElBQUksYUFBYSxDQUFDLENB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 */";
    	append_dev(document.head, style);
    }

    function create_fragment(ctx) {
    	let button;
    	let button_class_value;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "onclick", "this.blur();");
    			attr_dev(button, "variant", /*variant*/ ctx[0]);
    			button.disabled = /*disabled*/ ctx[1];
    			attr_dev(button, "class", button_class_value = "" + (/*variant*/ ctx[0] + " " + /*className*/ ctx[3] + " svelte-8intfl"));
    			toggle_class(button, "destructive", /*destructive*/ ctx[2]);
    			add_location(button, file, 12, 0, 225);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			dispose = [
    				listen_dev(button, "click", /*click_handler*/ ctx[6], false, false, false),
    				listen_dev(button, "submit", prevent_default(/*submit_handler*/ ctx[7]), false, true, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 16) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[4], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null));
    			}

    			if (!current || dirty & /*variant*/ 1) {
    				attr_dev(button, "variant", /*variant*/ ctx[0]);
    			}

    			if (!current || dirty & /*disabled*/ 2) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[1]);
    			}

    			if (!current || dirty & /*variant, className*/ 9 && button_class_value !== (button_class_value = "" + (/*variant*/ ctx[0] + " " + /*className*/ ctx[3] + " svelte-8intfl"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*variant, className, destructive*/ 13) {
    				toggle_class(button, "destructive", /*destructive*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { variant = "primary" } = $$props;
    	let { disabled = false } = $$props;
    	let { destructive = false } = $$props;
    	let { class: className = "" } = $$props;
    	const writable_props = ["variant", "disabled", "destructive", "class"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function submit_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("variant" in $$props) $$invalidate(0, variant = $$props.variant);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ("destructive" in $$props) $$invalidate(2, destructive = $$props.destructive);
    		if ("class" in $$props) $$invalidate(3, className = $$props.class);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		variant,
    		disabled,
    		destructive,
    		className
    	});

    	$$self.$inject_state = $$props => {
    		if ("variant" in $$props) $$invalidate(0, variant = $$props.variant);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ("destructive" in $$props) $$invalidate(2, destructive = $$props.destructive);
    		if ("className" in $$props) $$invalidate(3, className = $$props.className);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		variant,
    		disabled,
    		destructive,
    		className,
    		$$scope,
    		$$slots,
    		click_handler,
    		submit_handler
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-8intfl-style")) add_css();

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			variant: 0,
    			disabled: 1,
    			destructive: 2,
    			class: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get variant() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get destructive() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set destructive(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/figma-plugin-ds-svelte/src/components/Icon/index.svelte generated by Svelte v3.19.0 */

    const file$1 = "node_modules/figma-plugin-ds-svelte/src/components/Icon/index.svelte";

    function add_css$1() {
    	var style = element("style");
    	style.id = "svelte-1fwferi-style";
    	style.textContent = ".icon-component.svelte-1fwferi{display:flex;align-items:center;justify-content:center;cursor:default;width:var(--size-medium);height:var(--size-medium);font-family:var(--font-stack);font-size:var(--font-size-xsmall);user-select:none}.spin.svelte-1fwferi{animation:svelte-1fwferi-rotating 1.0s linear infinite}@keyframes svelte-1fwferi-rotating{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.icon-component *{fill:inherit;color:inherit}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguc3ZlbHRlIiwic291cmNlcyI6WyJpbmRleC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgICBleHBvcnQgbGV0IGljb25OYW1lID0gbnVsbDsgLy9wYXNzIHN2ZyBkYXRhIGludG8gdGhpcyB2YXIgYnkgaW1wb3J0aW5nIGFuIHN2ZyBpbiBwYXJlbnRcbiAgICBleHBvcnQgbGV0IHNwaW4gPSBmYWxzZTtcbiAgICBleHBvcnQgbGV0IGljb25UZXh0ID0gbnVsbDtcbiAgICBleHBvcnQgbGV0IGNvbG9yID0gXCJibGFjazhcIjtcbiAgICBleHBvcnQgeyBjbGFzc05hbWUgYXMgY2xhc3MgfTtcblxuICAgIGxldCBjbGFzc05hbWUgPSAnJztcbjwvc2NyaXB0PlxuXG48ZGl2IFxuICAgIGNsYXNzOnNwaW49e3NwaW59XG4gICAge2ljb25UZXh0fVxuICAgIHtpY29uTmFtZX0gXG4gICAgY2xhc3M9XCJpY29uLWNvbXBvbmVudCB7Y2xhc3NOYW1lfVwiXG4gICAgc3R5bGU9XCJjb2xvcjogdmFyKC0te2NvbG9yfSk7IGZpbGw6IHZhcigtLXtjb2xvcn0pXCI+XG4gICAgeyNpZiBpY29uVGV4dH1cbiAgICAgICAge2ljb25UZXh0fVxuICAgIHs6ZWxzZX1cbiAgICAgICAge0BodG1sIGljb25OYW1lfVxuICAgIHsvaWZ9XG48L2Rpdj5cblxuPHN0eWxlPlxuXG4gICAgLmljb24tY29tcG9uZW50IHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIGN1cnNvcjogZGVmYXVsdDtcbiAgICAgICAgd2lkdGg6IHZhcigtLXNpemUtbWVkaXVtKTtcbiAgICAgICAgaGVpZ2h0OiB2YXIoLS1zaXplLW1lZGl1bSk7XG4gICAgICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LXN0YWNrKTtcbiAgICAgICAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUteHNtYWxsKTtcbiAgICAgICAgdXNlci1zZWxlY3Q6IG5vbmU7XG4gICAgfVxuXG4gICAgLnNwaW4ge1xuICAgICAgICBhbmltYXRpb246IHJvdGF0aW5nIDEuMHMgbGluZWFyIGluZmluaXRlO1xuICAgIH1cblxuICAgIEBrZXlmcmFtZXMgcm90YXRpbmcge1xuICAgICAgICBmcm9tIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xuICAgICAgICB9XG4gICAgICAgIHRvIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICA6Z2xvYmFsKC5pY29uLWNvbXBvbmVudCAqKSB7XG4gICAgICAgIGZpbGw6IGluaGVyaXQ7XG4gICAgICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIH1cblxuPC9zdHlsZT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBeUJJLGVBQWUsZUFBQyxDQUFDLEFBQ2IsT0FBTyxDQUFFLElBQUksQ0FDYixXQUFXLENBQUUsTUFBTSxDQUNuQixlQUFlLENBQUUsTUFBTSxDQUN2QixNQUFNLENBQUUsT0FBTyxDQUNmLEtBQUssQ0FBRSxJQUFJLGFBQWEsQ0FBQyxDQUN6QixNQUFNLENBQUUsSUFBSSxhQUFhLENBQUMsQ0FDMUIsV0FBVyxDQUFFLElBQUksWUFBWSxDQUFDLENBQzlCLFNBQVMsQ0FBRSxJQUFJLGtCQUFrQixDQUFDLENBQ2xDLFdBQVcsQ0FBRSxJQUFJLEFBQ3JCLENBQUMsQUFFRCxLQUFLLGVBQUMsQ0FBQyxBQUNILFNBQVMsQ0FBRSx1QkFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxBQUM1QyxDQUFDLEFBRUQsV0FBVyx1QkFBUyxDQUFDLEFBQ2pCLElBQUksQUFBQyxDQUFDLEFBQ0YsU0FBUyxDQUFFLE9BQU8sSUFBSSxDQUFDLEFBQzNCLENBQUMsQUFDRCxFQUFFLEFBQUMsQ0FBQyxBQUNBLFNBQVMsQ0FBRSxPQUFPLE1BQU0sQ0FBQyxBQUM3QixDQUFDLEFBQ0wsQ0FBQyxBQUVPLGlCQUFpQixBQUFFLENBQUMsQUFDeEIsSUFBSSxDQUFFLE9BQU8sQ0FDYixLQUFLLENBQUUsT0FBTyxBQUNsQixDQUFDIn0= */";
    	append_dev(document.head, style);
    }

    // (19:4) {:else}
    function create_else_block(ctx) {
    	let html_tag;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(/*iconName*/ ctx[0], null);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(target, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*iconName*/ 1) html_tag.p(/*iconName*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(19:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (17:4) {#if iconText}
    function create_if_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*iconText*/ ctx[2]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*iconText*/ 4) set_data_dev(t, /*iconText*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(17:4) {#if iconText}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let div_class_value;

    	function select_block_type(ctx, dirty) {
    		if (/*iconText*/ ctx[2]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "icontext", /*iconText*/ ctx[2]);
    			attr_dev(div, "iconname", /*iconName*/ ctx[0]);
    			attr_dev(div, "class", div_class_value = "icon-component " + /*className*/ ctx[4] + " svelte-1fwferi");
    			set_style(div, "color", "var(--" + /*color*/ ctx[3] + ")");
    			set_style(div, "fill", "var(--" + /*color*/ ctx[3] + ")");
    			toggle_class(div, "spin", /*spin*/ ctx[1]);
    			add_location(div, file$1, 10, 0, 266);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty & /*iconText*/ 4) {
    				attr_dev(div, "icontext", /*iconText*/ ctx[2]);
    			}

    			if (dirty & /*iconName*/ 1) {
    				attr_dev(div, "iconname", /*iconName*/ ctx[0]);
    			}

    			if (dirty & /*className*/ 16 && div_class_value !== (div_class_value = "icon-component " + /*className*/ ctx[4] + " svelte-1fwferi")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*color*/ 8) {
    				set_style(div, "color", "var(--" + /*color*/ ctx[3] + ")");
    			}

    			if (dirty & /*color*/ 8) {
    				set_style(div, "fill", "var(--" + /*color*/ ctx[3] + ")");
    			}

    			if (dirty & /*className, spin*/ 18) {
    				toggle_class(div, "spin", /*spin*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { iconName = null } = $$props; //pass svg data into this var by importing an svg in parent
    	let { spin = false } = $$props;
    	let { iconText = null } = $$props;
    	let { color = "black8" } = $$props;
    	let { class: className = "" } = $$props;
    	const writable_props = ["iconName", "spin", "iconText", "color", "class"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("iconName" in $$props) $$invalidate(0, iconName = $$props.iconName);
    		if ("spin" in $$props) $$invalidate(1, spin = $$props.spin);
    		if ("iconText" in $$props) $$invalidate(2, iconText = $$props.iconText);
    		if ("color" in $$props) $$invalidate(3, color = $$props.color);
    		if ("class" in $$props) $$invalidate(4, className = $$props.class);
    	};

    	$$self.$capture_state = () => ({
    		iconName,
    		spin,
    		iconText,
    		color,
    		className
    	});

    	$$self.$inject_state = $$props => {
    		if ("iconName" in $$props) $$invalidate(0, iconName = $$props.iconName);
    		if ("spin" in $$props) $$invalidate(1, spin = $$props.spin);
    		if ("iconText" in $$props) $$invalidate(2, iconText = $$props.iconText);
    		if ("color" in $$props) $$invalidate(3, color = $$props.color);
    		if ("className" in $$props) $$invalidate(4, className = $$props.className);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [iconName, spin, iconText, color, className];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1fwferi-style")) add_css$1();

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			iconName: 0,
    			spin: 1,
    			iconText: 2,
    			color: 3,
    			class: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get iconName() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconName(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconText() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconText(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/figma-plugin-ds-svelte/src/components/Input/index.svelte generated by Svelte v3.19.0 */
    const file$2 = "node_modules/figma-plugin-ds-svelte/src/components/Input/index.svelte";

    function add_css$2() {
    	var style = element("style");
    	style.id = "svelte-jhaq8s-style";
    	style.textContent = ".input.svelte-jhaq8s{position:relative}input.svelte-jhaq8s{font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);letter-spacing:var( --font-letter-spacing-neg-xsmall);line-height:var(--line-height);position:relative;display:flex;overflow:visible;align-items:center;width:100%;height:30px;margin:1px 0 1px 0;padding:7px 4px 9px 7px;color:var(--black8);border:1px solid transparent;border-radius:var(--border-radius-small);outline:none;background-color:var(--white)}input.svelte-jhaq8s:hover,input.svelte-jhaq8s:placeholder-shown:hover{color:var(--black8);border:1px solid var(--black1);background-image:none}input.svelte-jhaq8s::selection{color:var(--black);background-color:var(--blue3)}input.svelte-jhaq8s::placeholder{color:var(--black3);border:1px solid transparent}input.svelte-jhaq8s:placeholder-shown{border:1px solid transparent;background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcAAAAABCAYAAABJ5n7WAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgSURBVHgB7cMBCQAACMTAiR3sX1TQHr+DK2B+I0lSjj29qAEYlIbeBgAAAABJRU5ErkJggg==');background-repeat:no-repeat;background-position:center bottom -0.99px;background-size:calc(100% - 10px) 1px}input.svelte-jhaq8s:focus:placeholder-shown{border:1px solid var(--blue);outline:1px solid var(--blue);outline-offset:-2px}input.svelte-jhaq8s:disabled:hover{border:1px solid transparent}input.svelte-jhaq8s:active,input.svelte-jhaq8s:focus{padding:7px 4px 9px 7px;color:var(--black);border:1px solid var(--blue);outline:1px solid var(--blue);outline-offset:-2px}input.svelte-jhaq8s:disabled{position:relative;color:var(--black3);background-image:none}input.svelte-jhaq8s:disabled:active{padding:7px 4px 9px 7px;outline:none}.borders.svelte-jhaq8s{border:1px solid var(--black1);background-image:none}.borders.svelte-jhaq8s:disabled{border:1px solid transparent;background-image:none}.borders.svelte-jhaq8s:disabled:placeholder-shown{border:1px solid transparent;background-image:none}.borders.svelte-jhaq8s:disabled:placeholder-shown:active{border:1px solid transparent;outline:none}.borders.svelte-jhaq8s:placeholder-shown{border:1px solid var(--black1);background-image:none}.indent.svelte-jhaq8s{text-indent:24px}.icon.svelte-jhaq8s{position:absolute;top:-1px;left:0;width:var(--size-medium);height:var(--size-medium);z-index:1}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguc3ZlbHRlIiwic291cmNlcyI6WyJpbmRleC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cblxuICAgIGltcG9ydCBJY29uIGZyb20gJy4vLi4vSWNvbi9pbmRleC5zdmVsdGUnO1xuXG4gICAgZXhwb3J0IGxldCBpZCA9IG51bGw7XG4gICAgZXhwb3J0IGxldCB2YWx1ZSA9IG51bGw7XG4gICAgZXhwb3J0IGxldCBuYW1lID0gbnVsbDtcbiAgICBleHBvcnQgbGV0IGljb25UZXh0ID0gbnVsbDtcbiAgICBleHBvcnQgbGV0IGJvcmRlcnMgPSBmYWxzZTtcbiAgICBleHBvcnQgbGV0IGRpc2FibGVkID0gZmFsc2U7XG4gICAgZXhwb3J0IGxldCBpY29uTmFtZSA9IG51bGw7XG4gICAgZXhwb3J0IGxldCBzcGluID0gZmFsc2U7XG4gICAgZXhwb3J0IGxldCBwbGFjZWhvbGRlciA9ICdJbnB1dCBzb21ldGhpbmcgaGVyZS4uLic7XG4gICAgZXhwb3J0IHsgY2xhc3NOYW1lIGFzIGNsYXNzIH07XG5cbiAgICBsZXQgY2xhc3NOYW1lID0gJyc7XG5cbjwvc2NyaXB0PlxuXG57I2lmIGljb25OYW1lIHx8IGljb25UZXh0fVxuICAgIDxkaXYgY2xhc3M9XCJpbnB1dCB7Y2xhc3NOYW1lfVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaWNvblwiPlxuICAgICAgICAgICAgPEljb24ge2ljb25OYW1lfSB7aWNvblRleHR9IHtzcGlufSBjb2xvcj1cImJsYWNrM1wiLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxpbnB1dCBcbiAgICAgICAgICAgIHR5cGU9XCJpbnB1dFwiXG4gICAgICAgICAgICBiaW5kOnZhbHVlPXt2YWx1ZX1cbiAgICAgICAgICAgIHtpZH1cbiAgICAgICAgICAgIHtuYW1lfVxuICAgICAgICAgICAge2Rpc2FibGVkfVxuICAgICAgICAgICAge3BsYWNlaG9sZGVyfVxuICAgICAgICAgICAgY2xhc3M9XCJpbmRlbnRcIlxuICAgICAgICAgICAgY2xhc3M6Ym9yZGVycz17Ym9yZGVyc31cbiAgICAgICAgPlxuICAgIDwvZGl2PlxuezplbHNlfVxuICAgIDxkaXYgY2xhc3M9XCJpbnB1dCB7Y2xhc3NOYW1lfVwiPlxuICAgICAgICA8aW5wdXQgXG4gICAgICAgICAgICB0eXBlPVwiaW5wdXRcIlxuICAgICAgICAgICAgYmluZDp2YWx1ZT17dmFsdWV9XG4gICAgICAgICAgICB7aWR9XG4gICAgICAgICAgICB7bmFtZX1cbiAgICAgICAgICAgIHtkaXNhYmxlZH1cbiAgICAgICAgICAgIHtwbGFjZWhvbGRlcn1cbiAgICAgICAgICAgIGNsYXNzOmJvcmRlcnM9e2JvcmRlcnN9XG4gICAgICAgID5cbiAgICA8L2Rpdj5cbnsvaWZ9XG5cbjxzdHlsZT5cblxuICAgIC5pbnB1dCB7XG4gICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICB9XG5cbiAgICBpbnB1dCB7XG4gICAgICAgIGZvbnQtc2l6ZTogdmFyKC0tZm9udC1zaXplLXhzbWFsbCk7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiB2YXIoLS1mb250LXdlaWdodC1ub3JtYWwpO1xuICAgICAgICBsZXR0ZXItc3BhY2luZzogdmFyKCAtLWZvbnQtbGV0dGVyLXNwYWNpbmctbmVnLXhzbWFsbCk7XG4gICAgICAgIGxpbmUtaGVpZ2h0OiB2YXIoLS1saW5lLWhlaWdodCk7XG4gICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgb3ZlcmZsb3c6IHZpc2libGU7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBoZWlnaHQ6IDMwcHg7XG4gICAgICAgIG1hcmdpbjogMXB4IDAgMXB4IDA7XG4gICAgICAgIHBhZGRpbmc6IDdweCA0cHggOXB4IDdweDtcbiAgICAgICAgY29sb3I6IHZhcigtLWJsYWNrOCk7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLXNtYWxsKTtcbiAgICAgICAgb3V0bGluZTogbm9uZTtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0td2hpdGUpO1xuICAgIH1cbiAgICBpbnB1dDpob3ZlciwgaW5wdXQ6cGxhY2Vob2xkZXItc2hvd246aG92ZXIge1xuXHRcdGNvbG9yOiB2YXIoLS1ibGFjazgpO1xuXHRcdGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJsYWNrMSk7XG4gICAgICAgIGJhY2tncm91bmQtaW1hZ2U6IG5vbmU7XG5cdH1cblx0aW5wdXQ6OnNlbGVjdGlvbiB7XG5cdFx0Y29sb3I6IHZhcigtLWJsYWNrKTtcblx0XHRiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ibHVlMyk7XG5cdH1cblx0aW5wdXQ6OnBsYWNlaG9sZGVyIHtcblx0XHRjb2xvcjogdmFyKC0tYmxhY2szKTtcblx0XHRib3JkZXI6IDFweCBzb2xpZCB0cmFuc3BhcmVudDtcblx0fVxuXHRpbnB1dDpwbGFjZWhvbGRlci1zaG93biB7XG5cdFx0Ym9yZGVyOiAxcHggc29saWQgdHJhbnNwYXJlbnQ7XG5cdFx0YmFja2dyb3VuZC1pbWFnZTogdXJsKCdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQWNBQUFBQUJDQVlBQUFCSjVuN1dBQUFBQ1hCSVdYTUFBQXNUQUFBTEV3RUFtcHdZQUFBQUFYTlNSMElBcnM0YzZRQUFBQVJuUVUxQkFBQ3hqd3Y4WVFVQUFBQWdTVVJCVkhnQjdjTUJDUUFBQ01UQWlSM3NYMVRRSHIrREsyQitJMGxTamoyOXFBRVlsSWJlQmdBQUFBQkpSVTVFcmtKZ2dnPT0nKTtcblx0XHRiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xuXHRcdGJhY2tncm91bmQtcG9zaXRpb246IGNlbnRlciBib3R0b20gLTAuOTlweDtcblx0XHRiYWNrZ3JvdW5kLXNpemU6IGNhbGMoMTAwJSAtIDEwcHgpIDFweDtcblx0fVxuICAgIGlucHV0OmZvY3VzOnBsYWNlaG9sZGVyLXNob3duIHtcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYmx1ZSk7XG4gICAgICAgIG91dGxpbmU6IDFweCBzb2xpZCB2YXIoLS1ibHVlKTtcbiAgICAgICAgb3V0bGluZS1vZmZzZXQ6IC0ycHg7XG4gICAgfVxuXHRpbnB1dDpkaXNhYmxlZDpob3ZlciB7XG5cdFx0Ym9yZGVyOiAxcHggc29saWQgdHJhbnNwYXJlbnQ7XG5cdH1cblx0aW5wdXQ6YWN0aXZlLCBpbnB1dDpmb2N1cyB7XG5cdFx0cGFkZGluZzogN3B4IDRweCA5cHggN3B4O1xuXG5cdFx0Y29sb3I6IHZhcigtLWJsYWNrKTtcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYmx1ZSk7XG4gICAgICAgIG91dGxpbmU6IDFweCBzb2xpZCB2YXIoLS1ibHVlKTtcbiAgICAgICAgb3V0bGluZS1vZmZzZXQ6IC0ycHg7XG5cdH1cblx0aW5wdXQ6ZGlzYWJsZWQge1xuXHRcdHBvc2l0aW9uOiByZWxhdGl2ZTtcblx0XHRjb2xvcjogdmFyKC0tYmxhY2szKTtcbiAgICAgICAgYmFja2dyb3VuZC1pbWFnZTogbm9uZTtcblx0fVxuXHRpbnB1dDpkaXNhYmxlZDphY3RpdmUge1xuXHRcdHBhZGRpbmc6IDdweCA0cHggOXB4IDdweDtcbiAgICAgICAgb3V0bGluZTogbm9uZTtcbiAgICB9XG5cbiAgICAuYm9yZGVycyB7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJsYWNrMSk7XG4gICAgICAgIGJhY2tncm91bmQtaW1hZ2U6IG5vbmU7XG4gICAgfVxuICAgIC5ib3JkZXJzOmRpc2FibGVkIHtcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgdHJhbnNwYXJlbnQ7XG4gICAgICAgIGJhY2tncm91bmQtaW1hZ2U6IG5vbmU7XG4gICAgfVxuICAgIC5ib3JkZXJzOmRpc2FibGVkOnBsYWNlaG9sZGVyLXNob3duIHtcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgdHJhbnNwYXJlbnQ7XG4gICAgICAgIGJhY2tncm91bmQtaW1hZ2U6IG5vbmU7XG4gICAgfVxuICAgIC5ib3JkZXJzOmRpc2FibGVkOnBsYWNlaG9sZGVyLXNob3duOmFjdGl2ZSB7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICAgICAgICBvdXRsaW5lOiBub25lO1xuICAgIH1cbiAgICAuYm9yZGVyczpwbGFjZWhvbGRlci1zaG93biB7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJsYWNrMSk7XG4gICAgICAgIGJhY2tncm91bmQtaW1hZ2U6IG5vbmU7XG4gICAgfVxuICAgIFxuICAgIC5pbmRlbnQge1xuICAgICAgICB0ZXh0LWluZGVudDogMjRweDtcbiAgICB9XG5cbiAgICAuaWNvbiB7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcblx0XHR0b3A6IC0xcHg7XG5cdFx0bGVmdDogMDtcbiAgICAgICAgd2lkdGg6IHZhcigtLXNpemUtbWVkaXVtKTtcbiAgICAgICAgaGVpZ2h0OiB2YXIoLS1zaXplLW1lZGl1bSk7XG4gICAgICAgIHotaW5kZXg6IDE7XG4gICAgfVxuXG48L3N0eWxlPiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFtREksTUFBTSxjQUFDLENBQUMsQUFDSixRQUFRLENBQUUsUUFBUSxBQUN0QixDQUFDLEFBRUQsS0FBSyxjQUFDLENBQUMsQUFDSCxTQUFTLENBQUUsSUFBSSxrQkFBa0IsQ0FBQyxDQUNsQyxXQUFXLENBQUUsSUFBSSxvQkFBb0IsQ0FBQyxDQUN0QyxjQUFjLENBQUUsS0FBSyxnQ0FBZ0MsQ0FBQyxDQUN0RCxXQUFXLENBQUUsSUFBSSxhQUFhLENBQUMsQ0FDL0IsUUFBUSxDQUFFLFFBQVEsQ0FDbEIsT0FBTyxDQUFFLElBQUksQ0FDYixRQUFRLENBQUUsT0FBTyxDQUNqQixXQUFXLENBQUUsTUFBTSxDQUNuQixLQUFLLENBQUUsSUFBSSxDQUNYLE1BQU0sQ0FBRSxJQUFJ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 */";
    	append_dev(document.head, style);
    }

    // (36:0) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let input;
    	let div_class_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			attr_dev(input, "type", "input");
    			attr_dev(input, "id", /*id*/ ctx[1]);
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			input.disabled = /*disabled*/ ctx[5];
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[8]);
    			attr_dev(input, "class", "svelte-jhaq8s");
    			toggle_class(input, "borders", /*borders*/ ctx[4]);
    			add_location(input, file$2, 37, 8, 889);
    			attr_dev(div, "class", div_class_value = "input " + /*className*/ ctx[9] + " svelte-jhaq8s");
    			add_location(div, file$2, 36, 4, 849);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*value*/ ctx[0]);
    			dispose = listen_dev(input, "input", /*input_input_handler_1*/ ctx[11]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 2) {
    				attr_dev(input, "id", /*id*/ ctx[1]);
    			}

    			if (dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (dirty & /*disabled*/ 32) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[5]);
    			}

    			if (dirty & /*placeholder*/ 256) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[8]);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty & /*borders*/ 16) {
    				toggle_class(input, "borders", /*borders*/ ctx[4]);
    			}

    			if (dirty & /*className*/ 512 && div_class_value !== (div_class_value = "input " + /*className*/ ctx[9] + " svelte-jhaq8s")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(36:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (20:0) {#if iconName || iconText}
    function create_if_block$1(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let input;
    	let div1_class_value;
    	let current;
    	let dispose;

    	const icon = new Icon({
    			props: {
    				iconName: /*iconName*/ ctx[6],
    				iconText: /*iconText*/ ctx[3],
    				spin: /*spin*/ ctx[7],
    				color: "black3"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(icon.$$.fragment);
    			t = space();
    			input = element("input");
    			attr_dev(div0, "class", "icon svelte-jhaq8s");
    			add_location(div0, file$2, 21, 8, 498);
    			attr_dev(input, "type", "input");
    			attr_dev(input, "id", /*id*/ ctx[1]);
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			input.disabled = /*disabled*/ ctx[5];
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[8]);
    			attr_dev(input, "class", "indent svelte-jhaq8s");
    			toggle_class(input, "borders", /*borders*/ ctx[4]);
    			add_location(input, file$2, 24, 8, 604);
    			attr_dev(div1, "class", div1_class_value = "input " + /*className*/ ctx[9] + " svelte-jhaq8s");
    			add_location(div1, file$2, 20, 4, 458);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(icon, div0, null);
    			append_dev(div1, t);
    			append_dev(div1, input);
    			set_input_value(input, /*value*/ ctx[0]);
    			current = true;
    			dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[10]);
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*iconName*/ 64) icon_changes.iconName = /*iconName*/ ctx[6];
    			if (dirty & /*iconText*/ 8) icon_changes.iconText = /*iconText*/ ctx[3];
    			if (dirty & /*spin*/ 128) icon_changes.spin = /*spin*/ ctx[7];
    			icon.$set(icon_changes);

    			if (!current || dirty & /*id*/ 2) {
    				attr_dev(input, "id", /*id*/ ctx[1]);
    			}

    			if (!current || dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (!current || dirty & /*disabled*/ 32) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[5]);
    			}

    			if (!current || dirty & /*placeholder*/ 256) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[8]);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty & /*borders*/ 16) {
    				toggle_class(input, "borders", /*borders*/ ctx[4]);
    			}

    			if (!current || dirty & /*className*/ 512 && div1_class_value !== (div1_class_value = "input " + /*className*/ ctx[9] + " svelte-jhaq8s")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(icon);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(20:0) {#if iconName || iconText}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*iconName*/ ctx[6] || /*iconText*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { id = null } = $$props;
    	let { value = null } = $$props;
    	let { name = null } = $$props;
    	let { iconText = null } = $$props;
    	let { borders = false } = $$props;
    	let { disabled = false } = $$props;
    	let { iconName = null } = $$props;
    	let { spin = false } = $$props;
    	let { placeholder = "Input something here..." } = $$props;
    	let { class: className = "" } = $$props;

    	const writable_props = [
    		"id",
    		"value",
    		"name",
    		"iconText",
    		"borders",
    		"disabled",
    		"iconName",
    		"spin",
    		"placeholder",
    		"class"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function input_input_handler_1() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("iconText" in $$props) $$invalidate(3, iconText = $$props.iconText);
    		if ("borders" in $$props) $$invalidate(4, borders = $$props.borders);
    		if ("disabled" in $$props) $$invalidate(5, disabled = $$props.disabled);
    		if ("iconName" in $$props) $$invalidate(6, iconName = $$props.iconName);
    		if ("spin" in $$props) $$invalidate(7, spin = $$props.spin);
    		if ("placeholder" in $$props) $$invalidate(8, placeholder = $$props.placeholder);
    		if ("class" in $$props) $$invalidate(9, className = $$props.class);
    	};

    	$$self.$capture_state = () => ({
    		Icon,
    		id,
    		value,
    		name,
    		iconText,
    		borders,
    		disabled,
    		iconName,
    		spin,
    		placeholder,
    		className
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("iconText" in $$props) $$invalidate(3, iconText = $$props.iconText);
    		if ("borders" in $$props) $$invalidate(4, borders = $$props.borders);
    		if ("disabled" in $$props) $$invalidate(5, disabled = $$props.disabled);
    		if ("iconName" in $$props) $$invalidate(6, iconName = $$props.iconName);
    		if ("spin" in $$props) $$invalidate(7, spin = $$props.spin);
    		if ("placeholder" in $$props) $$invalidate(8, placeholder = $$props.placeholder);
    		if ("className" in $$props) $$invalidate(9, className = $$props.className);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		id,
    		name,
    		iconText,
    		borders,
    		disabled,
    		iconName,
    		spin,
    		placeholder,
    		className,
    		input_input_handler,
    		input_input_handler_1
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-jhaq8s-style")) add_css$2();

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			id: 1,
    			value: 0,
    			name: 2,
    			iconText: 3,
    			borders: 4,
    			disabled: 5,
    			iconName: 6,
    			spin: 7,
    			placeholder: 8,
    			class: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get id() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconText() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconText(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borders() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borders(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconName() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconName(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/figma-plugin-ds-svelte/src/components/Label/index.svelte generated by Svelte v3.19.0 */

    const file$3 = "node_modules/figma-plugin-ds-svelte/src/components/Label/index.svelte";

    function add_css$3() {
    	var style = element("style");
    	style.id = "svelte-e8na0f-style";
    	style.textContent = "div.svelte-e8na0f{font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);letter-spacing:var( --font-letter-spacing-pos-xsmall);line-height:var(--line-height);color:var(--black3);height:var(--size-medium);width:100%;display:flex;align-items:center;cursor:default;user-select:none;padding:0 calc(var(--size-xxsmall) / 2) 0 var(--size-xxsmall)}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguc3ZlbHRlIiwic291cmNlcyI6WyJpbmRleC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cblxuICAgIGxldCBjbGFzc05hbWUgPSAnJztcblxuPC9zY3JpcHQ+XG5cbjxkaXY+XG4gICAgPHNsb3Q+PC9zbG90PlxuPC9kaXY+XG5cbjxzdHlsZT5cblxuICAgIGRpdiB7XG4gICAgICAgIGZvbnQtc2l6ZTogdmFyKC0tZm9udC1zaXplLXhzbWFsbCk7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiB2YXIoLS1mb250LXdlaWdodC1ub3JtYWwpO1xuICAgICAgICBsZXR0ZXItc3BhY2luZzogdmFyKCAtLWZvbnQtbGV0dGVyLXNwYWNpbmctcG9zLXhzbWFsbCk7XG4gICAgICAgIGxpbmUtaGVpZ2h0OiB2YXIoLS1saW5lLWhlaWdodCk7XG4gICAgICAgIGNvbG9yOiB2YXIoLS1ibGFjazMpO1xuICAgICAgICBoZWlnaHQ6IHZhcigtLXNpemUtbWVkaXVtKTtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIGN1cnNvcjogZGVmYXVsdDtcbiAgICAgICAgdXNlci1zZWxlY3Q6IG5vbmU7XG4gICAgICAgIHBhZGRpbmc6IDAgY2FsYyh2YXIoLS1zaXplLXh4c21hbGwpIC8gMikgMCB2YXIoLS1zaXplLXh4c21hbGwpO1xuICAgIH1cblxuPC9zdHlsZT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBWUksR0FBRyxjQUFDLENBQUMsQUFDRCxTQUFTLENBQUUsSUFBSSxrQkFBa0IsQ0FBQyxDQUNsQyxXQUFXLENBQUUsSUFBSSxvQkFBb0IsQ0FBQyxDQUN0QyxjQUFjLENBQUUsS0FBSyxnQ0FBZ0MsQ0FBQyxDQUN0RCxXQUFXLENBQUUsSUFBSSxhQUFhLENBQUMsQ0FDL0IsS0FBSyxDQUFFLElBQUksUUFBUSxDQUFDLENBQ3BCLE1BQU0sQ0FBRSxJQUFJLGFBQWEsQ0FBQyxDQUMxQixLQUFLLENBQUUsSUFBSSxDQUNYLE9BQU8sQ0FBRSxJQUFJLENBQ2IsV0FBVyxDQUFFLE1BQU0sQ0FDbkIsTUFBTSxDQUFFLE9BQU8sQ0FDZixXQUFXLENBQUUsSUFBSSxDQUNqQixPQUFPLENBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksY0FBYyxDQUFDLEFBQ2xFLENBQUMifQ== */";
    	append_dev(document.head, style);
    }

    function create_fragment$3(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-e8na0f");
    			add_location(div, file$3, 6, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 2) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[1], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let className = "";
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ className });

    	$$self.$inject_state = $$props => {
    		if ("className" in $$props) className = $$props.className;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [className, $$scope, $$slots];
    }

    class Label extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-e8na0f-style")) add_css$3();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Label",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* node_modules/figma-plugin-ds-svelte/src/components/SelectDivider/index.svelte generated by Svelte v3.19.0 */

    const file$4 = "node_modules/figma-plugin-ds-svelte/src/components/SelectDivider/index.svelte";

    function add_css$4() {
    	var style = element("style");
    	style.id = "svelte-1bja8tp-style";
    	style.textContent = ".label.svelte-1bja8tp{font-size:var(--font-size-small);font-weight:var(--font-weight-normal);letter-spacing:var( --font-letter-spacing-neg-small);line-height:var(--line-height);display:flex;align-items:center;height:var(--size-small);margin-top:var(--size-xxsmall);padding:0 var(--size-xxsmall) 0 var(--size-medium);color:var(--white4)}.label.svelte-1bja8tp:first-child{border-top:none;margin-top:0}.divider.svelte-1bja8tp{background-color:var(--white2);display:block;height:1px;margin:8px 0 7px 0}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguc3ZlbHRlIiwic291cmNlcyI6WyJpbmRleC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cblxuICAgIGV4cG9ydCBsZXQgbGFiZWwgPSBmYWxzZTtcbiAgICBcbjwvc2NyaXB0PlxuXG57I2lmIGxhYmVsPT09dHJ1ZX1cbiAgICA8bGkgY2xhc3M9XCJsYWJlbFwiPjxzbG90Lz48L2xpPlxuezplbHNlfVxuICAgIDxsaSBjbGFzcz1cImRpdmlkZXJcIj48L2xpPlxuey9pZn1cblxuPHN0eWxlPlxuXG4gICAgLmxhYmVsIHtcbiAgICAgICAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUtc21hbGwpO1xuICAgICAgICBmb250LXdlaWdodDogdmFyKC0tZm9udC13ZWlnaHQtbm9ybWFsKTtcbiAgICAgICAgbGV0dGVyLXNwYWNpbmc6IHZhciggLS1mb250LWxldHRlci1zcGFjaW5nLW5lZy1zbWFsbCk7XG4gICAgICAgIGxpbmUtaGVpZ2h0OiB2YXIoLS1saW5lLWhlaWdodCk7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG5cdFx0aGVpZ2h0OiB2YXIoLS1zaXplLXNtYWxsKTtcblx0XHRtYXJnaW4tdG9wOiB2YXIoLS1zaXplLXh4c21hbGwpO1xuXHRcdHBhZGRpbmc6IDAgdmFyKC0tc2l6ZS14eHNtYWxsKSAwIHZhcigtLXNpemUtbWVkaXVtKTtcblx0XHRjb2xvcjogdmFyKC0td2hpdGU0KTtcbiAgICB9XG4gICAgLmxhYmVsOmZpcnN0LWNoaWxkIHtcbiAgICAgICAgYm9yZGVyLXRvcDogbm9uZTtcbiAgICAgICAgbWFyZ2luLXRvcDogMDtcbiAgICB9XG5cbiAgICAuZGl2aWRlciB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXdoaXRlMik7XG4gICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuXHRcdGhlaWdodDogMXB4O1xuXHRcdG1hcmdpbjogOHB4IDAgN3B4IDA7XG4gICAgfVxuXG48L3N0eWxlPiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFjSSxNQUFNLGVBQUMsQ0FBQyxBQUNKLFNBQVMsQ0FBRSxJQUFJLGlCQUFpQixDQUFDLENBQ2pDLFdBQVcsQ0FBRSxJQUFJLG9CQUFvQixDQUFDLENBQ3RDLGNBQWMsQ0FBRSxLQUFLLCtCQUErQixDQUFDLENBQ3JELFdBQVcsQ0FBRSxJQUFJLGFBQWEsQ0FBQyxDQUMvQixPQUFPLENBQUUsSUFBSSxDQUNiLFdBQVcsQ0FBRSxNQUFNLENBQ3pCLE1BQU0sQ0FBRSxJQUFJLFlBQVksQ0FBQyxDQUN6QixVQUFVLENBQUUsSUFBSSxjQUFjLENBQUMsQ0FDL0IsT0FBTyxDQUFFLENBQUMsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxDQUNuRCxLQUFLLENBQUUsSUFBSSxRQUFRLENBQUMsQUFDbEIsQ0FBQyxBQUNELHFCQUFNLFlBQVksQUFBQyxDQUFDLEFBQ2hCLFVBQVUsQ0FBRSxJQUFJLENBQ2hCLFVBQVUsQ0FBRSxDQUFDLEFBQ2pCLENBQUMsQUFFRCxRQUFRLGVBQUMsQ0FBQyxBQUNOLGdCQUFnQixDQUFFLElBQUksUUFBUSxDQUFDLENBQy9CLE9BQU8sQ0FBRSxLQUFLLENBQ3BCLE1BQU0sQ0FBRSxHQUFHLENBQ1gsTUFBTSxDQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQUFDakIsQ0FBQyJ9 */";
    	append_dev(document.head, style);
    }

    // (9:0) {:else}
    function create_else_block$2(ctx) {
    	let li;

    	const block = {
    		c: function create() {
    			li = element("li");
    			attr_dev(li, "class", "divider svelte-1bja8tp");
    			add_location(li, file$4, 9, 4, 122);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(9:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (7:0) {#if label===true}
    function create_if_block$2(ctx) {
    	let li;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (default_slot) default_slot.c();
    			attr_dev(li, "class", "label svelte-1bja8tp");
    			add_location(li, file$4, 7, 4, 79);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (default_slot) {
    				default_slot.m(li, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 2) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[1], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(7:0) {#if label===true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*label*/ ctx[0] === true) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { label = false } = $$props;
    	const writable_props = ["label"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SelectDivider> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ label });

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [label, $$scope, $$slots];
    }

    class SelectDivider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1bja8tp-style")) add_css$4();
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { label: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectDivider",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get label() {
    		throw new Error("<SelectDivider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<SelectDivider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/figma-plugin-ds-svelte/src/components/SelectItem/index.svelte generated by Svelte v3.19.0 */

    const file$5 = "node_modules/figma-plugin-ds-svelte/src/components/SelectItem/index.svelte";

    function add_css$5() {
    	var style = element("style");
    	style.id = "svelte-gbdhgi-style";
    	style.textContent = "li.svelte-gbdhgi{align-items:center;color:var(--white);cursor:default;display:flex;font-family:var(--font-stack);font-size:var(--font-size-small);font-weight:var(--font-weight-normal);letter-spacing:var(--font-letter-spacing-neg-xsmall);line-height:var(--font-line-height);height:var(--size-small);padding:0px var(--size-xsmall) 0px var(--size-xxsmall);user-select:none;outline:none;transition-property:background-color;transition-duration:30ms}.label.svelte-gbdhgi{overflow-x:hidden;white-space:nowrap;text-overflow:ellipsis;pointer-events:none}.highlight.svelte-gbdhgi,li.svelte-gbdhgi:hover,li.svelte-gbdhgi:focus{background-color:var(--blue)}.icon.svelte-gbdhgi{width:var(--size-xsmall);height:var(--size-xsmall);margin-right:var(--size-xxsmall);opacity:0;pointer-events:none;background-image:url('data:image/svg+xml;utf8,%3Csvg%20fill%3D%22none%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%20width%3D%2216%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20clip-rule%3D%22evenodd%22%20d%3D%22m13.2069%205.20724-5.50002%205.49996-.70711.7072-.70711-.7072-3-2.99996%201.41422-1.41421%202.29289%202.29289%204.79293-4.79289z%22%20fill%3D%22%23fff%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E');background-repeat:no-repeat;background-position:center center}.icon.selected.svelte-gbdhgi{opacity:1.0}.blink.svelte-gbdhgi,.blink.svelte-gbdhgi:hover{background-color:transparent}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguc3ZlbHRlIiwic291cmNlcyI6WyJpbmRleC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgICBcbiAgICBleHBvcnQgbGV0IGl0ZW1JZDtcbiAgICBleHBvcnQgbGV0IHNlbGVjdGVkID0gZmFsc2U7XG4gICAgZXhwb3J0IHsgY2xhc3NOYW1lIGFzIGNsYXNzIH07XG5cbiAgICBsZXQgY2xhc3NOYW1lID0gJyc7XG5cbjwvc2NyaXB0PlxuXG48bGkge2l0ZW1JZH0gdGFiaW5kZXg9e2l0ZW1JZCsxfSBjbGFzczpoaWdobGlnaHQ9e3NlbGVjdGVkfSBjbGFzcz17Y2xhc3NOYW1lfSBvbjptb3VzZWVudGVyIG9uOmNsaWNrPlxuICAgIDxkaXYgY2xhc3M9XCJpY29uXCIgY2xhc3M6c2VsZWN0ZWQ9e3NlbGVjdGVkfT5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwibGFiZWxcIj48c2xvdCAvPjwvZGl2PlxuPC9saT5cblxuPHN0eWxlPlxuXG4gICAgbGkge1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICBjb2xvcjogdmFyKC0td2hpdGUpO1xuICAgICAgICBjdXJzb3I6IGRlZmF1bHQ7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LXN0YWNrKTtcbiAgICAgICAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUtc21hbGwpO1xuICAgICAgICBmb250LXdlaWdodDogdmFyKC0tZm9udC13ZWlnaHQtbm9ybWFsKTtcbiAgICAgICAgbGV0dGVyLXNwYWNpbmc6IHZhcigtLWZvbnQtbGV0dGVyLXNwYWNpbmctbmVnLXhzbWFsbCk7XG4gICAgICAgIGxpbmUtaGVpZ2h0OiB2YXIoLS1mb250LWxpbmUtaGVpZ2h0KTtcbiAgICAgICAgaGVpZ2h0OiB2YXIoLS1zaXplLXNtYWxsKTtcbiAgICAgICAgcGFkZGluZzogMHB4IHZhcigtLXNpemUteHNtYWxsKSAwcHggdmFyKC0tc2l6ZS14eHNtYWxsKTtcbiAgICAgICAgdXNlci1zZWxlY3Q6IG5vbmU7XG4gICAgICAgIG91dGxpbmU6IG5vbmU7XG4gICAgICAgIHRyYW5zaXRpb24tcHJvcGVydHk6IGJhY2tncm91bmQtY29sb3I7XG4gICAgICAgIHRyYW5zaXRpb24tZHVyYXRpb246IDMwbXM7XG4gICAgfVxuXG4gICAgLmxhYmVsIHtcbiAgICAgICAgb3ZlcmZsb3cteDogaGlkZGVuO1xuICAgICAgICB3aGl0ZS1zcGFjZTogbm93cmFwOyBcbiAgICAgICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG4gICAgICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICAgIH1cblxuICAgIC5oaWdobGlnaHQsIGxpOmhvdmVyLCBsaTpmb2N1cyB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJsdWUpO1xuICAgIH1cblxuICAgIC5pY29uIHtcbiAgICAgICAgd2lkdGg6IHZhcigtLXNpemUteHNtYWxsKTtcbiAgICAgICAgaGVpZ2h0OiB2YXIoLS1zaXplLXhzbWFsbCk7XG4gICAgICAgIG1hcmdpbi1yaWdodDogdmFyKC0tc2l6ZS14eHNtYWxsKTtcbiAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybCgnZGF0YTppbWFnZS9zdmcreG1sO3V0ZjgsJTNDc3ZnJTIwZmlsbCUzRCUyMm5vbmUlMjIlMjBoZWlnaHQlM0QlMjIxNiUyMiUyMHZpZXdCb3glM0QlMjIwJTIwMCUyMDE2JTIwMTYlMjIlMjB3aWR0aCUzRCUyMjE2JTIyJTIweG1sbnMlM0QlMjJodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjIlM0UlM0NwYXRoJTIwY2xpcC1ydWxlJTNEJTIyZXZlbm9kZCUyMiUyMGQlM0QlMjJtMTMuMjA2OSUyMDUuMjA3MjQtNS41MDAwMiUyMDUuNDk5OTYtLjcwNzExLjcwNzItLjcwNzExLS43MDcyLTMtMi45OTk5NiUyMDEuNDE0MjItMS40MTQyMSUyMDIuMjkyODklMjAyLjI5Mjg5JTIwNC43OTI5My00Ljc5Mjg5eiUyMiUyMGZpbGwlM0QlMjIlMjNmZmYlMjIlMjBmaWxsLXJ1bGUlM0QlMjJldmVub2RkJTIyJTJGJTNFJTNDJTJGc3ZnJTNFJyk7XG4gICAgICAgIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XG5cdFx0YmFja2dyb3VuZC1wb3NpdGlvbjogY2VudGVyIGNlbnRlcjtcbiAgICB9XG4gICAgLmljb24uc2VsZWN0ZWQge1xuICAgICAgICBvcGFjaXR5OiAxLjA7XG4gICAgfVxuXG4gICAgLmJsaW5rLCAuYmxpbms6aG92ZXIge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAgICB9XG5cbjwvc3R5bGU+Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWtCSSxFQUFFLGNBQUMsQ0FBQyxBQUNBLFdBQVcsQ0FBRSxNQUFNLENBQ25CLEtBQUssQ0FBRSxJQUFJLE9BQU8sQ0FBQyxDQUNuQixNQUFNLENBQUUsT0FBTyxDQUNmLE9BQU8sQ0FBRSxJQUFJLENBQ2IsV0FBVyxDQUFFLElBQUksWUFBWSxDQUFDLENBQzlCLFNBQVMsQ0FBRSxJQUFJLGlCQUFpQixDQUFDLENBQ2pDLFdBQVcsQ0FBRSxJQUFJLG9CQUFvQixDQUFDLENBQ3RDLGNBQWMsQ0FBRSxJQUFJLGdDQUFnQyxDQUFDLENBQ3JELFdBQVcsQ0FBRSxJQUFJLGtCQUFrQixDQUFDLENBQ3BDLE1BQU0sQ0FBRSxJQUFJLFlBQVksQ0FBQyxDQUN6QixPQUFPLENBQUUsR0FBRyxDQUFDLElBQUksYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksY0FBYyxDQUFDLENBQ3ZELFdBQVcsQ0FBRSxJQUFJLENBQ2pCLE9BQU8sQ0FBRSxJQUFJLENBQ2IsbUJBQW1CLENBQUUsZ0JBQWdCLENBQ3JDLG1CQUFtQixDQUFFLElBQUksQUFDN0IsQ0FBQyxBQUVELE1BQU0sY0FBQyxDQUFDLEFBQ0osVUFBVSxDQUFFLE1BQU0sQ0FDbEIsV0FBVyxDQUFFLE1BQU0sQ0FDbkIsYUFBYSxDQUFFLFFBQVEsQ0FDdkIsY0FBYyxDQUFFLElBQUksQUFDeEIsQ0FBQyxBQUVELHdCQUFVLENBQUUsZ0JBQUUsTUFBTSxDQUFFLGdCQUFFLE1BQU0sQUFBQyxDQUFDLEFBQzVCLGdCQUFnQixDQUFFLElBQUksTUFBTSxDQUFDLEFBQ2pDLENBQUMsQUFFRCxLQUFLLGNBQUMsQ0FBQyxBQUNILEtBQUssQ0FBRSxJQUFJLGFBQWEsQ0FBQyxDQUN6QixNQUFNLENBQUUsSUFBSSxhQUFhLENBQUMsQ0FDMUIsWUFBWSxDQUFFLElBQUksY0FBYyxDQUFDLENBQ2pDLE9BQU8sQ0FBRSxDQUFDLENBQ1YsY0FBYyxDQUFFLElBQUksQ0FDcEIsZ0JBQWdCLENBQUUsSUFBSSx5YUFBeWEsQ0FBQyxDQUNoYyxpQkFBaUIsQ0FBRSxTQUFTLENBQ2xDLG1CQUFtQixDQUFFLE1BQU0sQ0FBQyxNQUFNLEFBQ2hDLENBQUMsQUFDRCxLQUFLLFNBQVMsY0FBQyxDQUFDLEFBQ1osT0FBTyxDQUFFLEdBQUcsQUFDaEIsQ0FBQyxBQUVELG9CQUFNLENBQUUsb0JBQU0sTUFBTSxBQUFDLENBQUMsQUFDbEIsZ0JBQWdCLENBQUUsV0FBVyxBQUNqQyxDQUFDIn0= */";
    	append_dev(document.head, style);
    }

    function create_fragment$5(ctx) {
    	let li;
    	let div0;
    	let t;
    	let div1;
    	let li_tabindex_value;
    	let li_class_value;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			li = element("li");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "icon svelte-gbdhgi");
    			toggle_class(div0, "selected", /*selected*/ ctx[1]);
    			add_location(div0, file$5, 11, 4, 248);
    			attr_dev(div1, "class", "label svelte-gbdhgi");
    			add_location(div1, file$5, 13, 4, 308);
    			attr_dev(li, "itemid", /*itemId*/ ctx[0]);
    			attr_dev(li, "tabindex", li_tabindex_value = /*itemId*/ ctx[0] + 1);
    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(/*className*/ ctx[2]) + " svelte-gbdhgi"));
    			toggle_class(li, "highlight", /*selected*/ ctx[1]);
    			add_location(li, file$5, 10, 0, 142);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div0);
    			append_dev(li, t);
    			append_dev(li, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;

    			dispose = [
    				listen_dev(li, "mouseenter", /*mouseenter_handler*/ ctx[5], false, false, false),
    				listen_dev(li, "click", /*click_handler*/ ctx[6], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selected*/ 2) {
    				toggle_class(div0, "selected", /*selected*/ ctx[1]);
    			}

    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 8) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[3], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null));
    			}

    			if (!current || dirty & /*itemId*/ 1) {
    				attr_dev(li, "itemid", /*itemId*/ ctx[0]);
    			}

    			if (!current || dirty & /*itemId*/ 1 && li_tabindex_value !== (li_tabindex_value = /*itemId*/ ctx[0] + 1)) {
    				attr_dev(li, "tabindex", li_tabindex_value);
    			}

    			if (!current || dirty & /*className*/ 4 && li_class_value !== (li_class_value = "" + (null_to_empty(/*className*/ ctx[2]) + " svelte-gbdhgi"))) {
    				attr_dev(li, "class", li_class_value);
    			}

    			if (dirty & /*className, selected*/ 6) {
    				toggle_class(li, "highlight", /*selected*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (default_slot) default_slot.d(detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { itemId } = $$props;
    	let { selected = false } = $$props;
    	let { class: className = "" } = $$props;
    	const writable_props = ["itemId", "selected", "class"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SelectItem> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("itemId" in $$props) $$invalidate(0, itemId = $$props.itemId);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("class" in $$props) $$invalidate(2, className = $$props.class);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ itemId, selected, className });

    	$$self.$inject_state = $$props => {
    		if ("itemId" in $$props) $$invalidate(0, itemId = $$props.itemId);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("className" in $$props) $$invalidate(2, className = $$props.className);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		itemId,
    		selected,
    		className,
    		$$scope,
    		$$slots,
    		mouseenter_handler,
    		click_handler
    	];
    }

    class SelectItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-gbdhgi-style")) add_css$5();
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { itemId: 0, selected: 1, class: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectItem",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*itemId*/ ctx[0] === undefined && !("itemId" in props)) {
    			console.warn("<SelectItem> was created without expected prop 'itemId'");
    		}
    	}

    	get itemId() {
    		throw new Error("<SelectItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemId(value) {
    		throw new Error("<SelectItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<SelectItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<SelectItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<SelectItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<SelectItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-click-outside/src/index.svelte generated by Svelte v3.19.0 */
    const file$6 = "node_modules/svelte-click-outside/src/index.svelte";

    function create_fragment$6(ctx) {
    	let t;
    	let div;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			t = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div, file$6, 31, 0, 549);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[7](div);
    			current = true;
    			dispose = listen_dev(document.body, "click", /*onClickOutside*/ ctx[1], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 32) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[5], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[7](null);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { exclude = [] } = $$props;
    	let child;
    	const dispatch = createEventDispatcher();

    	function isExcluded(target) {
    		var parent = target;

    		while (parent) {
    			if (exclude.indexOf(parent) >= 0 || parent === child) {
    				return true;
    			}

    			parent = parent.parentNode;
    		}

    		return false;
    	}

    	function onClickOutside(event) {
    		if (!isExcluded(event.target)) {
    			dispatch("clickoutside");
    		}
    	}

    	const writable_props = ["exclude"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Src> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, child = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("exclude" in $$props) $$invalidate(2, exclude = $$props.exclude);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		exclude,
    		child,
    		dispatch,
    		isExcluded,
    		onClickOutside
    	});

    	$$self.$inject_state = $$props => {
    		if ("exclude" in $$props) $$invalidate(2, exclude = $$props.exclude);
    		if ("child" in $$props) $$invalidate(0, child = $$props.child);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		child,
    		onClickOutside,
    		exclude,
    		dispatch,
    		isExcluded,
    		$$scope,
    		$$slots,
    		div_binding
    	];
    }

    class Src extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { exclude: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Src",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get exclude() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exclude(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/figma-plugin-ds-svelte/src/components/SelectMenu/index.svelte generated by Svelte v3.19.0 */

    const { document: document_1 } = globals;
    const file$7 = "node_modules/figma-plugin-ds-svelte/src/components/SelectMenu/index.svelte";

    function add_css$6() {
    	var style = element("style");
    	style.id = "svelte-15vif0i-style";
    	style.textContent = ".wrapper.svelte-15vif0i.svelte-15vif0i{position:relative}button.svelte-15vif0i.svelte-15vif0i{display:flex;align-items:center;border:1px solid transparent;height:30px;width:100%;margin:1px 0 1px 0;padding:0px var(--size-xxsmall) 0px var(--size-xxsmall);overflow-y:hidden;border-radius:var(--border-radius-small)}button.svelte-15vif0i.svelte-15vif0i:hover{border-color:var(--black1)}button.svelte-15vif0i:hover .placeholder.svelte-15vif0i{color:var(--black8)}button.svelte-15vif0i:hover .caret svg path.svelte-15vif0i,button.svelte-15vif0i:focus .caret svg path.svelte-15vif0i{fill:var(--black8)}button.svelte-15vif0i:hover .caret.svelte-15vif0i,button.svelte-15vif0i:focus .caret.svelte-15vif0i{margin-left:auto}button.svelte-15vif0i.svelte-15vif0i:focus{border:1px solid var(--blue);outline:1px solid var(--blue);outline-offset:-2px}button.svelte-15vif0i:focus .placeholder.svelte-15vif0i{color:var(--black8)}button.svelte-15vif0i:disabled .label.svelte-15vif0i{color:var(--black3)}button.svelte-15vif0i.svelte-15vif0i:disabled:hover{justify-content:flex-start;border-color:transparent}button.svelte-15vif0i:disabled:hover .placeholder.svelte-15vif0i{color:var(--black3)}button.svelte-15vif0i:disabled:hover .caret svg path.svelte-15vif0i{fill:var(--black3)}button.svelte-15vif0i .svelte-15vif0i{pointer-events:none}.label.svelte-15vif0i.svelte-15vif0i,.placeholder.svelte-15vif0i.svelte-15vif0i{font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);letter-spacing:var( --font-letter-spacing-neg-xsmall);line-height:var(--line-height);color:var(--black8);margin-right:6px;margin-top:-3px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis}.placeholder.svelte-15vif0i.svelte-15vif0i{color:var(--black3)}.caret.svelte-15vif0i.svelte-15vif0i{display:block;margin-top:-1px}.caret.svelte-15vif0i svg path.svelte-15vif0i{fill:var(--black3)}.icon.svelte-15vif0i.svelte-15vif0i{margin-left:-8px;margin-top:-2px;margin-right:0}.menu.svelte-15vif0i.svelte-15vif0i{position:absolute;top:32px;left:0;width:100%;background-color:var(--hud);box-shadow:var(--shadow-hud);padding:var(--size-xxsmall) 0 var(--size-xxsmall) 0;border-radius:var(--border-radius-small);margin:0;z-index:50;overflow-x:overlay;overflow-y:auto}.menu.svelte-15vif0i.svelte-15vif0i::-webkit-scrollbar{width:12px;background-color:transparent;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=);background-repeat:repeat;background-size:100% auto\n    }.menu.svelte-15vif0i.svelte-15vif0i::-webkit-scrollbar-track{border:solid 3px transparent;-webkit-box-shadow:inset 0 0 10px 10px transparent;box-shadow:inset 0 0 10px 10px transparent}.menu.svelte-15vif0i.svelte-15vif0i::-webkit-scrollbar-thumb{border:solid 3px transparent;border-radius:6px;-webkit-box-shadow:inset 0 0 10px 10px rgba(255,255,255,.4);box-shadow:inset 0 0 10px 10px rgba(255,255,255,.4)}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguc3ZlbHRlIiwic291cmNlcyI6WyJpbmRleC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgICBpbXBvcnQgeyBvbk1vdW50IH0gZnJvbSAnc3ZlbHRlJztcbiAgICBpbXBvcnQgeyBjcmVhdGVFdmVudERpc3BhdGNoZXIgfSBmcm9tICdzdmVsdGUnO1xuICAgIGltcG9ydCBDbGlja091dHNpZGUgZnJvbSAnc3ZlbHRlLWNsaWNrLW91dHNpZGUnO1xuICAgIGltcG9ydCBTZWxlY3RJdGVtIGZyb20gJy4vLi4vU2VsZWN0SXRlbS9pbmRleC5zdmVsdGUnO1xuICAgIGltcG9ydCBTZWxlY3REaXZpZGVyIGZyb20gJy4vLi4vU2VsZWN0RGl2aWRlci9pbmRleC5zdmVsdGUnO1xuICAgIGltcG9ydCBJY29uIGZyb20gJy4vLi4vSWNvbi9pbmRleC5zdmVsdGUnO1xuXG4gICAgZXhwb3J0IGxldCBpY29uTmFtZSA9IG51bGw7XG4gICAgZXhwb3J0IGxldCBpY29uVGV4dCA9IG51bGw7XG4gICAgZXhwb3J0IGxldCBkaXNhYmxlZCA9IGZhbHNlO1xuICAgIGV4cG9ydCBsZXQgbWFjT1NCbGluayA9IGZhbHNlO1xuICAgIGV4cG9ydCBsZXQgbWVudUl0ZW1zID0gW107IC8vcGFzcyBkYXRhIGluIHZpYSB0aGlzIHByb3AgdG8gZ2VuZXJhdGUgbWVudSBpdGVtc1xuICAgIGV4cG9ydCBsZXQgcGxhY2Vob2xkZXIgPSBcIlBsZWFzZSBtYWtlIGEgc2VsZWN0aW9uLlwiO1xuICAgIGV4cG9ydCBsZXQgdmFsdWUgPSBudWxsOyAvL3N0b3JlcyB0aGUgY3VycmVudCBzZWxlY3Rpb24sIG5vdGUsIHRoZSB2YWx1ZSB3aWxsIGJlIGFuIG9iamVjdCBmcm9tIHlvdXIgYXJyYXlcbiAgICBleHBvcnQgbGV0IHNob3dHcm91cExhYmVscyA9IGZhbHNlOyAvL2RlZmF1bHQgcHJvcCwgdHJ1ZSB3aWxsIHNob3cgb3B0aW9uIGdyb3VwIGxhYmVsc1xuICAgIGV4cG9ydCB7IGNsYXNzTmFtZSBhcyBjbGFzcyB9O1xuXG4gICAgY29uc3QgZGlzcGF0Y2ggPSBjcmVhdGVFdmVudERpc3BhdGNoZXIoKTtcbiAgICBsZXQgY2xhc3NOYW1lID0gJyc7XG4gICAgbGV0IGdyb3VwcyA9IGNoZWNrR3JvdXBzKCk7XG4gICAgbGV0IG1lbnVXcmFwcGVyLCBtZW51QnV0dG9uLCBtZW51TGlzdDtcbiAgICAkOm1lbnVJdGVtcywgdXBkYXRlU2VsZWN0ZWRBbmRJZHMoKTtcblxuICAgIC8vRlVOQ1RJT05TXG5cbiAgICAvL3NldCBwbGFjZWhvbGRlclxuICAgIGlmIChtZW51SXRlbXMubGVuZ3RoIDw9IDApIHtcbiAgICAgICAgcGxhY2Vob2xkZXIgPSAnVGhlcmUgYXJlIG5vIGl0ZW1zIHRvIHNlbGVjdCc7XG4gICAgICAgIGRpc2FibGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvL2Fzc2lnbiBpZCdzIHRvIHRoZSBpbnB1dCBhcnJheVxuICAgIG9uTW91bnQoYXN5bmMgKCkgPT4ge1xuICAgICAgICB1cGRhdGVTZWxlY3RlZEFuZElkcygpO1xuICAgIH0pO1xuXG4gICAgLy8gdGhpcyBmdW5jdGlvbiBydW5zIGV2ZXJ5dGltZSB0aGUgbWVudUl0ZW1zIGFycmF5IG9zIHVwZGF0ZWRcbiAgICAvLyBpdCB3aWxsIGF1dG8gYXNzaWduIGlkcyBhbmQga2VlcCB0aGUgdmFsdWUgdmFyIHVwZGF0ZWRcbiAgICBmdW5jdGlvbiB1cGRhdGVTZWxlY3RlZEFuZElkcygpIHtcbiAgICAgICAgbWVudUl0ZW1zLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAvL3VwZGF0ZSBpZFxuICAgICAgICAgICAgaXRlbVsnaWQnXSA9IGluZGV4O1xuICAgICAgICAgICAgLy91cGRhdGUgc2VsZWN0aW9uXG4gICAgICAgICAgICBpZiAoaXRlbS5zZWxlY3RlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gIGl0ZW07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vZGV0ZXJtaW5lIGlmIG9wdGlvbiBncm91cHMgYXJlIHByZXNlbnRcbiAgICBmdW5jdGlvbiBjaGVja0dyb3VwcygpIHtcbiAgICAgICAgbGV0IGdyb3VwQ291bnQgPSAwO1xuICAgICAgICBpZiAobWVudUl0ZW1zKSB7XG4gICAgICAgICAgICBtZW51SXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5ncm91cCAhPSBudWxsKSB7IGdyb3VwQ291bnQrKzsgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoZ3JvdXBDb3VudCA9PT0gbWVudUl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vbWVudSBoaWdobGlnaHQgZnVuY3Rpb24gb24gdGhlIHNlbGVjdGVkIG1lbnUgaXRlbVxuICAgIGZ1bmN0aW9uIHJlbW92ZUhpZ2hsaWdodChldmVudCkge1xuICAgICAgICBsZXQgaXRlbXMgPSBBcnJheS5mcm9tKGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmNoaWxkcmVuKTtcbiAgICAgICAgaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgIGl0ZW0uYmx1cigpO1xuICAgICAgICAgICAgaXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdoaWdobGlnaHQnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy9ydW4gZm9yIGFsbCBtZW51IGNsaWNrIGV2ZW50c1xuICAgIC8vdGhpcyBvcGVucy9jbG9zZXMgdGhlIG1lbnVcbiAgICBmdW5jdGlvbiBtZW51Q2xpY2soZXZlbnQpIHtcblxuICAgICAgICByZXNldE1lbnVQcm9wZXJ0aWVzKCk7XG5cbiAgICAgICAgaWYgKCFldmVudC50YXJnZXQpIHtcbiAgICAgICAgICAgIG1lbnVMaXN0LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0LmNvbnRhaW5zKG1lbnVCdXR0b24pKSB7XG4gICAgICAgICAgICBsZXQgdG9wUG9zID0gMDtcblxuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgLy90b2dnbGUgbWVudVxuICAgICAgICAgICAgICAgIG1lbnVMaXN0LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuXG4gICAgICAgICAgICAgICAgbGV0IGlkID0gdmFsdWUuaWQ7XG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkSXRlbSA9IG1lbnVMaXN0LnF1ZXJ5U2VsZWN0b3IoJ1tpdGVtSWQ9XCInK2lkKydcIl0nKTtcbiAgICAgICAgICAgICAgICBzZWxlY3RlZEl0ZW0uZm9jdXMoKTsgLy9zZXQgZm9jdXMgdG8gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBpdGVtXG5cbiAgICAgICAgICAgICAgICAvLyBjYWxjdWxhdGUgZGlzdGFuY2UgZnJvbSB0b3Agc28gdGhhdCB3ZSBjYW4gcG9zaXRpb24gdGhlIGRyb3Bkb3duIG1lbnVcbiAgICAgICAgICAgICAgICBsZXQgcGFyZW50VG9wID0gbWVudUxpc3QuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xuICAgICAgICAgICAgICAgIGxldCBpdGVtVG9wID0gc2VsZWN0ZWRJdGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcbiAgICAgICAgICAgICAgICBsZXQgdG9wUG9zID0gKGl0ZW1Ub3AgLSBwYXJlbnRUb3ApIC0gMztcbiAgICAgICAgICAgICAgICBtZW51TGlzdC5zdHlsZS50b3AgPSAtTWF0aC5hYnModG9wUG9zKSArICdweCc7XG5cbiAgICAgICAgICAgICAgICAvL3VwZGF0ZSBzaXplIGFuZCBwb3NpdGlvbiBiYXNlZCBvbiBwbHVnaW4gVUlcbiAgICAgICAgICAgICAgICByZXNpemVBbmRQb3NpdGlvbigpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lbnVMaXN0LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgICAgICAgICAgICAgIG1lbnVMaXN0LnN0eWxlLnRvcCA9ICcwcHgnO1xuICAgICAgICAgICAgICAgIGxldCBmaXJzdEl0ZW0gPSBtZW51TGlzdC5xdWVyeVNlbGVjdG9yKCdbaXRlbUlkPVwiMFwiXScpO1xuICAgICAgICAgICAgICAgIGZpcnN0SXRlbS5mb2N1cygpO1xuXG4gICAgICAgICAgICAgICAgLy91cGRhdGUgc2l6ZSBhbmQgcG9zaXRpb24gYmFzZWQgb24gcGx1Z2luIFVJXG4gICAgICAgICAgICAgICAgcmVzaXplQW5kUG9zaXRpb24oKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAobWVudUxpc3QuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgICAgICAgLy9maW5kIHNlbGVjdGVkIGl0ZW0gaW4gYXJyYXlcbiAgICAgICAgICAgIGxldCBpdGVtSWQgPSBwYXJzZUludChldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKCdpdGVtSWQnKSk7IFxuXG4gICAgICAgICAgICAvL3JlbW92ZSBjdXJyZW50IHNlbGVjdGlvbiBpZiB0aGVyZSBpcyBvbmVcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIG1lbnVJdGVtc1t2YWx1ZS5pZF0uc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1lbnVJdGVtc1tpdGVtSWRdLnNlbGVjdGVkID0gdHJ1ZTsgLy9zZWxlY3QgY3VycmVudCBpdGVtXG4gICAgICAgICAgICB1cGRhdGVTZWxlY3RlZEFuZElkcygpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2NoYW5nZScsIG1lbnVJdGVtc1tpdGVtSWRdKTtcblxuICAgICAgICAgICAgaWYgKG1hY09TQmxpbmspIHtcbiAgICAgICAgICAgICAgICB2YXIgeCA9IDQ7XG4gICAgICAgICAgICAgICAgdmFyIGludGVydmFsID0gNzA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9ibGluayB0aGUgYmFja2dyb3VuZFxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoJ2JsaW5rJyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGkgKiBpbnRlcnZhbClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9kZWxheSBjbG9zaW5nIHRoZSBtZW51XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lbnVMaXN0LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpOyAvL2hpZGUgdGhlIG1lbnVcbiAgICAgICAgICAgICAgICB9LCAoaW50ZXJ2YWwgKiB4KSArIDQwKVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lbnVMaXN0LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpOyAvL2hpZGUgdGhlIG1lbnVcbiAgICAgICAgICAgICAgICBtZW51QnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJyk7IC8vcmVtb3ZlIHNlbGVjdGVkIHN0YXRlIGZyb20gYnV0dG9uXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB0aGlzIGZ1bmN0aW9uIGVuc3VyZXMgdGhhdCB0aGUgc2VsZWN0IG1lbnVcbiAgICAvLyBmaXRzIGluc2lkZSB0aGUgcGx1Z2luIHZpZXdwb3J0XG4gICAgLy8gaWYgaXRzIHRvbyBiaWcsIGl0IHdpbGwgcmVzaXplIGl0IGFuZCBlbmFibGUgYSBzY3JvbGxiYXJcbiAgICAvLyBpZiBpdHMgb2ZmIHNjcmVlbiBpdCB3aWxsIHNoaWZ0IHRoZSBwb3NpdGlvblxuICAgIGZ1bmN0aW9uIHJlc2l6ZUFuZFBvc2l0aW9uKCkge1xuXG4gICAgICAgIC8vc2V0IHRoZSBtYXggaGVpZ2h0IG9mIHRoZSBtZW51IGJhc2VkIG9uIHBsdWdpbi9pZnJhbWUgd2luZG93XG4gICAgICAgIGxldCBtYXhNZW51SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0IC0gMTY7XG4gICAgICAgIGxldCBtZW51SGVpZ2h0ID0gbWVudUxpc3Qub2Zmc2V0SGVpZ2h0O1xuICAgICAgICBsZXQgbWVudVJlc2l6ZWQgPSBmYWxzZTtcblxuICAgICAgICBpZiAobWVudUhlaWdodCA+IG1heE1lbnVIZWlnaHQpIHtcbiAgICAgICAgICAgIG1lbnVMaXN0LnN0eWxlLmhlaWdodCA9IG1heE1lbnVIZWlnaHQgKyAncHgnO1xuICAgICAgICAgICAgbWVudVJlc2l6ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9sZXRzIGFkanVzdCB0aGUgcG9zaXRpb24gb2YgdGhlIG1lbnUgaWYgaXRzIGN1dCBvZmYgZnJvbSB2aWV3cG9ydFxuICAgICAgICB2YXIgYm91bmRpbmcgPSBtZW51TGlzdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdmFyIHBhcmVudEJvdW5kaW5nID0gbWVudUJ1dHRvbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdmFyIHRvcExpbWl0ID0gcGFyZW50Qm91bmRpbmcudG9wIC0gODtcblxuICAgICAgICBpZiAoYm91bmRpbmcudG9wIDwgMCkge1xuICAgICAgICAgICAgbWVudUxpc3Quc3R5bGUudG9wID0gLU1hdGguYWJzKHBhcmVudEJvdW5kaW5nLnRvcCAtIDgpICsgJ3B4JztcbiAgICAgICAgfVxuICAgICAgICBpZiAoYm91bmRpbmcuYm90dG9tID4gKHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KSkge1xuICAgICAgICAgICAgbGV0IG1pblRvcCA9IC1NYXRoLmFicyhwYXJlbnRCb3VuZGluZy50b3AgLSAod2luZG93LmlubmVySGVpZ2h0IC0gbWVudUhlaWdodCAtIDgpKTtcbiAgICAgICAgICAgIGxldCBuZXdUb3AgPSAtTWF0aC5hYnMoYm91bmRpbmcuYm90dG9tIC0gd2luZG93LmlubmVySGVpZ2h0ICsgMTYpO1xuICAgICAgICAgICAgaWYgKG1lbnVSZXNpemVkKSB7XG4gICAgICAgICAgICAgICAgbWVudUxpc3Quc3R5bGUudG9wID0gLU1hdGguYWJzKHBhcmVudEJvdW5kaW5nLnRvcCAtIDgpICsgJ3B4JzsgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5ld1RvcCA+IG1pblRvcCkge1xuICAgICAgICAgICAgICAgIG1lbnVMaXN0LnN0eWxlLnRvcCA9IG1pblRvcCArICdweCc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICBtZW51TGlzdC5zdHlsZS50b3AgPSBuZXdUb3AgKyAncHgnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH1cblxuICAgIH1cbiAgICBmdW5jdGlvbiByZXNldE1lbnVQcm9wZXJ0aWVzKCkge1xuICAgICAgICBtZW51TGlzdC5zdHlsZS5oZWlnaHQgPSAnYXV0byc7XG4gICAgICAgIG1lbnVMaXN0LnN0eWxlLnRvcCA9ICcwcHgnO1xuICAgIH1cblxuPC9zY3JpcHQ+XG5cbjxDbGlja091dHNpZGUgb246Y2xpY2tvdXRzaWRlPXttZW51Q2xpY2t9PlxuICAgIDxkaXYgXG4gICAgICAgIG9uOmNoYW5nZVxuICAgICAgICBiaW5kOnRoaXM9e21lbnVXcmFwcGVyfVxuICAgICAgICB7ZGlzYWJsZWR9XG4gICAgICAgIHtwbGFjZWhvbGRlcn1cbiAgICAgICAge3Nob3dHcm91cExhYmVsc31cbiAgICAgICAge21hY09TQmxpbmt9XG4gICAgICAgIGNsYXNzPVwid3JhcHBlciB7Y2xhc3NOYW1lfVwiXG4gICAgICAgID5cblxuICAgICAgICA8YnV0dG9uIGJpbmQ6dGhpcz17bWVudUJ1dHRvbn0gb246Y2xpY2s9e21lbnVDbGlja30gZGlzYWJsZWQ9e2Rpc2FibGVkfT5cbiAgICAgICAgICAgIHsjaWYgaWNvbk5hbWV9XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uXCI+PEljb24gaWNvbk5hbWU9e2ljb25OYW1lfSBjb2xvcj1cImJsYWNrM1wiLz48L3NwYW4+XG4gICAgICAgICAgICB7OmVsc2UgaWYgaWNvblRleHR9XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uXCI+PEljb24gaWNvblRleHQ9e2ljb25UZXh0fSBjb2xvcj1cImJsYWNrM1wiLz48L3NwYW4+XG4gICAgICAgICAgICB7L2lmfVxuXG4gICAgICAgICAgICB7I2lmIHZhbHVlfVxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGFiZWxcIj57dmFsdWUubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgezplbHNlfVxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicGxhY2Vob2xkZXJcIj57cGxhY2Vob2xkZXJ9PC9zcGFuPlxuICAgICAgICAgICAgey9pZn1cblxuICAgICAgICAgICAgeyNpZiAhZGlzYWJsZWR9XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjYXJldFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3ZnIHdpZHRoPVwiOFwiIGhlaWdodD1cIjhcIiB2aWV3Qm94PVwiMCAwIDggOFwiIGZpbGw9XCJub25lXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPiA8cGF0aCBmaWxsLXJ1bGU9XCJldmVub2RkXCIgY2xpcC1ydWxlPVwiZXZlbm9kZFwiIGQ9XCJNMy42NDY0NSA1LjM1MzU5TDAuNjQ2NDU0IDIuMzUzNTlMMS4zNTM1NiAxLjY0NjQ4TDQuMDAwMDEgNC4yOTI5M0w2LjY0NjQ1IDEuNjQ2NDhMNy4zNTM1NiAyLjM1MzU5TDQuMzUzNTYgNS4zNTM1OUw0LjAwMDAxIDUuNzA3MTRMMy42NDY0NSA1LjM1MzU5WlwiIGZpbGw9XCJibGFja1wiLz4gPC9zdmc+XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgey9pZn1cbiAgICAgICAgPC9idXR0b24+XG5cbiAgICAgICAgPHVsIGNsYXNzPVwibWVudSBoaWRkZW5cIiBiaW5kOnRoaXM9e21lbnVMaXN0fT5cbiAgICAgICAgeyNpZiBtZW51SXRlbXMubGVuZ3RoID4gMH1cbiAgICAgICAgICAgIHsjZWFjaCBtZW51SXRlbXMgYXMgaXRlbSwgaX1cbiAgICAgICAgICAgICAgICB7I2lmIGkgPT09IDB9XG4gICAgICAgICAgICAgICAgICAgIHsjaWYgaXRlbS5ncm91cCAmJiBzaG93R3JvdXBMYWJlbHN9XG4gICAgICAgICAgICAgICAgICAgICAgICA8U2VsZWN0RGl2aWRlciBsYWJlbD57aXRlbS5ncm91cH08L1NlbGVjdERpdmlkZXI+XG4gICAgICAgICAgICAgICAgICAgIHsvaWZ9XG4gICAgICAgICAgICAgICAgezplbHNlIGlmIGkgPiAwICYmIGl0ZW0uZ3JvdXAgJiYgbWVudUl0ZW1zW2kgLSAxXS5ncm91cCAhPSBpdGVtLmdyb3VwfVxuICAgICAgICAgICAgICAgICAgICB7I2lmIHNob3dHcm91cExhYmVsc31cbiAgICAgICAgICAgICAgICAgICAgICAgIDxTZWxlY3REaXZpZGVyIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8U2VsZWN0RGl2aWRlciBsYWJlbD57aXRlbS5ncm91cH08L1NlbGVjdERpdmlkZXI+XG4gICAgICAgICAgICAgICAgICAgIHs6ZWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxTZWxlY3REaXZpZGVyIC8+XG4gICAgICAgICAgICAgICAgICAgIHsvaWZ9XG4gICAgICAgICAgICAgICAgey9pZn1cbiAgICAgICAgICAgICAgICA8U2VsZWN0SXRlbSBvbjpjbGljaz17bWVudUNsaWNrfSBvbjptb3VzZWVudGVyPXtyZW1vdmVIaWdobGlnaHR9IGl0ZW1JZD17aXRlbS5pZH0gYmluZDpzZWxlY3RlZD17aXRlbS5zZWxlY3RlZH0+e2l0ZW0ubGFiZWx9PC9TZWxlY3RJdGVtPlxuICAgICAgICAgICAgey9lYWNofVxuICAgICAgICB7L2lmfVxuICAgICAgICA8L3VsPlxuICAgIDwvZGl2PlxuPC9DbGlja091dHNpZGU+XG5cblxuPHN0eWxlPlxuXG4gICAgLndyYXBwZXIge1xuICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgfVxuXG4gICAgYnV0dG9uIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgdHJhbnNwYXJlbnQ7XG4gICAgICAgIGhlaWdodDogMzBweDtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIG1hcmdpbjogMXB4IDAgMXB4IDA7XG4gICAgICAgIHBhZGRpbmc6IDBweCB2YXIoLS1zaXplLXh4c21hbGwpIDBweCB2YXIoLS1zaXplLXh4c21hbGwpOyAgIFxuICAgICAgICBvdmVyZmxvdy15OiBoaWRkZW47XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMtc21hbGwpO1xuICAgIH1cbiAgICBidXR0b246aG92ZXIge1xuICAgICAgICBib3JkZXItY29sb3I6IHZhcigtLWJsYWNrMSk7XG4gICAgfVxuICAgIGJ1dHRvbjpob3ZlciAucGxhY2Vob2xkZXIge1xuICAgICAgICBjb2xvcjogdmFyKC0tYmxhY2s4KTtcbiAgICB9XG4gICAgYnV0dG9uOmhvdmVyIC5jYXJldCBzdmcgcGF0aCwgYnV0dG9uOmZvY3VzIC5jYXJldCBzdmcgcGF0aCB7XG4gICAgICAgIGZpbGw6IHZhcigtLWJsYWNrOCk7XG4gICAgfVxuICAgIGJ1dHRvbjpob3ZlciAuY2FyZXQsIGJ1dHRvbjpmb2N1cyAuY2FyZXQge1xuICAgICAgICBtYXJnaW4tbGVmdDogYXV0bztcbiAgICB9XG4gICAgYnV0dG9uOmZvY3VzIHtcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYmx1ZSk7XG4gICAgICAgIG91dGxpbmU6IDFweCBzb2xpZCB2YXIoLS1ibHVlKTtcbiAgICAgICAgb3V0bGluZS1vZmZzZXQ6IC0ycHg7XG4gICAgfVxuICAgIGJ1dHRvbjpmb2N1cyAucGxhY2Vob2xkZXIge1xuICAgICAgICBjb2xvcjogdmFyKC0tYmxhY2s4KTtcbiAgICB9XG4gICAgYnV0dG9uOmRpc2FibGVkIC5sYWJlbCB7XG4gICAgICAgIGNvbG9yOiB2YXIoLS1ibGFjazMpO1xuICAgIH1cbiAgICBidXR0b246ZGlzYWJsZWQ6aG92ZXIge1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7XG4gICAgICAgIGJvcmRlci1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gICAgfVxuICAgIGJ1dHRvbjpkaXNhYmxlZDpob3ZlciAucGxhY2Vob2xkZXIge1xuICAgICAgICBjb2xvcjogdmFyKC0tYmxhY2szKTtcbiAgICB9XG4gICAgYnV0dG9uOmRpc2FibGVkOmhvdmVyIC5jYXJldCBzdmcgcGF0aCB7XG4gICAgICAgIGZpbGw6IHZhcigtLWJsYWNrMyk7XG4gICAgfVxuICAgIGJ1dHRvbiAqIHtcbiAgICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgfVxuXG4gICAgLmxhYmVsLCAucGxhY2Vob2xkZXIge1xuICAgICAgICBmb250LXNpemU6IHZhcigtLWZvbnQtc2l6ZS14c21hbGwpO1xuICAgICAgICBmb250LXdlaWdodDogdmFyKC0tZm9udC13ZWlnaHQtbm9ybWFsKTtcbiAgICAgICAgbGV0dGVyLXNwYWNpbmc6IHZhciggLS1mb250LWxldHRlci1zcGFjaW5nLW5lZy14c21hbGwpO1xuICAgICAgICBsaW5lLWhlaWdodDogdmFyKC0tbGluZS1oZWlnaHQpO1xuICAgICAgICBjb2xvcjogdmFyKC0tYmxhY2s4KTtcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiA2cHg7XG4gICAgICAgIG1hcmdpbi10b3A6IC0zcHg7XG4gICAgICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgICAgIG92ZXJmbG93LXg6IGhpZGRlbjtcbiAgICAgICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG4gICAgfVxuXG4gICAgLnBsYWNlaG9sZGVyIHtcbiAgICAgICAgY29sb3I6IHZhcigtLWJsYWNrMyk7XG4gICAgfVxuXG4gICAgLmNhcmV0IHtcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIG1hcmdpbi10b3A6IC0xcHg7XG4gICAgfVxuXG4gICAgLmNhcmV0IHN2ZyBwYXRoIHtcbiAgICAgICAgZmlsbDogdmFyKC0tYmxhY2szKTtcbiAgICB9XG5cbiAgICAuaWNvbiB7XG4gICAgICAgIG1hcmdpbi1sZWZ0OiAtOHB4O1xuICAgICAgICBtYXJnaW4tdG9wOiAtMnB4O1xuICAgICAgICBtYXJnaW4tcmlnaHQ6IDA7XG4gICAgfVxuXG4gICAgLm1lbnUge1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIHRvcDozMnB4O1xuICAgICAgICBsZWZ0OjA7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1odWQpO1xuICAgICAgICBib3gtc2hhZG93OiB2YXIoLS1zaGFkb3ctaHVkKTtcbiAgICAgICAgcGFkZGluZzogdmFyKC0tc2l6ZS14eHNtYWxsKSAwIHZhcigtLXNpemUteHhzbWFsbCkgMDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cy1zbWFsbCk7XG4gICAgICAgIG1hcmdpbjogMDtcbiAgICAgICAgei1pbmRleDogNTA7XG4gICAgICAgIG92ZXJmbG93LXg6IG92ZXJsYXk7XG4gICAgICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgfVxuICAgIC5tZW51Ojotd2Via2l0LXNjcm9sbGJhcntcbiAgICAgICAgd2lkdGg6MTJweDtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjp0cmFuc3BhcmVudDtcbiAgICAgICAgYmFja2dyb3VuZC1pbWFnZTogdXJsKGRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQUVBQUFBQkNBUUFBQUMxSEF3Q0FBQUFDMGxFUVZSNDJtTmtZQUFBQUFZQUFqQ0IwQzhBQUFBQVNVVk9SSzVDWUlJPSk7XG4gICAgICAgIGJhY2tncm91bmQtcmVwZWF0OnJlcGVhdDtcbiAgICAgICAgYmFja2dyb3VuZC1zaXplOjEwMCUgYXV0b1xuICAgIH1cbiAgICAubWVudTo6LXdlYmtpdC1zY3JvbGxiYXItdHJhY2t7XG4gICAgICAgIGJvcmRlcjpzb2xpZCAzcHggdHJhbnNwYXJlbnQ7XG4gICAgICAgIC13ZWJraXQtYm94LXNoYWRvdzppbnNldCAwIDAgMTBweCAxMHB4IHRyYW5zcGFyZW50O1xuICAgICAgICBib3gtc2hhZG93Omluc2V0IDAgMCAxMHB4IDEwcHggdHJhbnNwYXJlbnQ7XG4gICAgfVxuICAgIC5tZW51Ojotd2Via2l0LXNjcm9sbGJhci10aHVtYntcbiAgICAgICAgYm9yZGVyOnNvbGlkIDNweCB0cmFuc3BhcmVudDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czo2cHg7XG4gICAgICAgIC13ZWJraXQtYm94LXNoYWRvdzppbnNldCAwIDAgMTBweCAxMHB4IHJnYmEoMjU1LDI1NSwyNTUsLjQpO1xuICAgICAgICBib3gtc2hhZG93Omluc2V0IDAgMCAxMHB4IDEwcHggcmdiYSgyNTUsMjU1LDI1NSwuNCk7XG4gICAgfVxuICAgICAgICBcblxuPC9zdHlsZT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBMFBJLFFBQVEsOEJBQUMsQ0FBQyxBQUNOLFFBQVEsQ0FBRSxRQUFRLEFBQ3RCLENBQUMsQUFFRCxNQUFNLDhCQUFDLENBQUMsQUFDSixPQUFPLENBQUUsSUFBSSxDQUNiLFdBQVcsQ0FBRSxNQUFNLENBQ25CLE1BQU0sQ0FBRSxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcs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QUFDSCxXQUFXLENBQUUsSUFBSSxDQUNqQixVQUFVLENBQUUsSUFBSSxDQUNoQixZQUFZLENBQUUsQ0FBQyxBQUNuQixDQUFDLEFBRUQsS0FBSyw4QkFBQyxDQUFDLEFBQ0gsUUFBUSxDQUFFLFFBQVEsQ0FDbEIsSUFBSSxJQUFJLENBQ1IsS0FBSyxDQUFDLENBQ04sS0FBSyxDQUFFLElBQUksQ0FDWCxnQkFBZ0IsQ0FBRSxJQUFJLEtBQUssQ0FBQyxDQUM1QixVQUFVLENBQUUsSUFBSSxZQUFZLENBQUMsQ0FDN0IsT0FBTyxDQUFFLElBQUksY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUNwRCxhQUFhLENBQUUsSUFBSSxxQkFBcUIsQ0FBQyxDQUN6QyxNQUFNLENBQUUsQ0FBQyxDQUNULE9BQU8sQ0FBRSxFQUFFLENBQ1gsVUFBVSxDQUFFLE9BQU8sQ0FDbkIsVUFBVSxDQUFFLElBQUksQUFDcEIsQ0FBQyxBQUNELG1DQUFLLG1CQUFtQixDQUFDLEFBQ3JCLE1BQU0sSUFBSSxDQUNWLGlCQUFpQixXQUFXLENBQzVCLGdCQUFnQixDQUFFLElBQUksa0hBQWtILENBQUMsQ0FDekksa0JBQWtCLE1BQU0sQ0FDeEIsZ0JBQWdCLElBQUksQ0FBQyxJQUFJO0lBQzdCLENBQUMsQUFDRCxtQ0FBSyx5QkFBeUIsQ0FBQyxBQUMzQixPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUM1QixtQkFBbUIsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQ2xELFdBQVcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEFBQzlDLENBQUMsQUFDRCxtQ0FBSyx5QkFBeUIsQ0FBQyxBQUMzQixPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUM1QixjQUFjLEdBQUcsQ0FDakIsbUJBQW1CLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FDM0QsV0FBVyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEFBQ3ZELENBQUMifQ== */";
    	append_dev(document_1.head, style);
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[25] = list;
    	child_ctx[26] = i;
    	return child_ctx;
    }

    // (209:31) 
    function create_if_block_8(ctx) {
    	let span;
    	let current;

    	const icon = new Icon({
    			props: {
    				iconText: /*iconText*/ ctx[5],
    				color: "black3"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(icon.$$.fragment);
    			attr_dev(span, "class", "icon svelte-15vif0i");
    			add_location(span, file$7, 209, 16, 7183);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(icon, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*iconText*/ 32) icon_changes.iconText = /*iconText*/ ctx[5];
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(icon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(209:31) ",
    		ctx
    	});

    	return block;
    }

    // (207:12) {#if iconName}
    function create_if_block_7(ctx) {
    	let span;
    	let current;

    	const icon = new Icon({
    			props: {
    				iconName: /*iconName*/ ctx[4],
    				color: "black3"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(icon.$$.fragment);
    			attr_dev(span, "class", "icon svelte-15vif0i");
    			add_location(span, file$7, 207, 16, 7066);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(icon, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*iconName*/ 16) icon_changes.iconName = /*iconName*/ ctx[4];
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(icon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(207:12) {#if iconName}",
    		ctx
    	});

    	return block;
    }

    // (215:12) {:else}
    function create_else_block_1(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*placeholder*/ ctx[2]);
    			attr_dev(span, "class", "placeholder svelte-15vif0i");
    			add_location(span, file$7, 215, 16, 7388);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*placeholder*/ 4) set_data_dev(t, /*placeholder*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(215:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (213:12) {#if value}
    function create_if_block_6(ctx) {
    	let span;
    	let t_value = /*value*/ ctx[3].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "label svelte-15vif0i");
    			add_location(span, file$7, 213, 16, 7311);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 8 && t_value !== (t_value = /*value*/ ctx[3].label + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(213:12) {#if value}",
    		ctx
    	});

    	return block;
    }

    // (219:12) {#if !disabled}
    function create_if_block_5(ctx) {
    	let span;
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			span = element("span");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "clip-rule", "evenodd");
    			attr_dev(path, "d", "M3.64645 5.35359L0.646454 2.35359L1.35356 1.64648L4.00001 4.29293L6.64645 1.64648L7.35356 2.35359L4.35356 5.35359L4.00001 5.70714L3.64645 5.35359Z");
    			attr_dev(path, "fill", "black");
    			attr_dev(path, "class", "svelte-15vif0i");
    			add_location(path, file$7, 220, 112, 7631);
    			attr_dev(svg, "width", "8");
    			attr_dev(svg, "height", "8");
    			attr_dev(svg, "viewBox", "0 0 8 8");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "svelte-15vif0i");
    			add_location(svg, file$7, 220, 20, 7539);
    			attr_dev(span, "class", "caret svelte-15vif0i");
    			add_location(span, file$7, 219, 16, 7498);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, svg);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(219:12) {#if !disabled}",
    		ctx
    	});

    	return block;
    }

    // (227:8) {#if menuItems.length > 0}
    function create_if_block$3(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*menuItems*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menuItems, menuClick, removeHighlight, showGroupLabels*/ 4226) {
    				each_value = /*menuItems*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(227:8) {#if menuItems.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (233:86) 
    function create_if_block_3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_4, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type_3(ctx, dirty) {
    		if (/*showGroupLabels*/ ctx[7]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_3(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_3(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(233:86) ",
    		ctx
    	});

    	return block;
    }

    // (229:16) {#if i === 0}
    function create_if_block_1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*item*/ ctx[24].group && /*showGroupLabels*/ ctx[7] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*item*/ ctx[24].group && /*showGroupLabels*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(229:16) {#if i === 0}",
    		ctx
    	});

    	return block;
    }

    // (237:20) {:else}
    function create_else_block$3(ctx) {
    	let current;
    	const selectdivider = new SelectDivider({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(selectdivider.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(selectdivider, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectdivider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectdivider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selectdivider, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(237:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (234:20) {#if showGroupLabels}
    function create_if_block_4(ctx) {
    	let t;
    	let current;
    	const selectdivider0 = new SelectDivider({ $$inline: true });

    	const selectdivider1 = new SelectDivider({
    			props: {
    				label: true,
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(selectdivider0.$$.fragment);
    			t = space();
    			create_component(selectdivider1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(selectdivider0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(selectdivider1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const selectdivider1_changes = {};

    			if (dirty & /*$$scope, menuItems*/ 134217730) {
    				selectdivider1_changes.$$scope = { dirty, ctx };
    			}

    			selectdivider1.$set(selectdivider1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectdivider0.$$.fragment, local);
    			transition_in(selectdivider1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectdivider0.$$.fragment, local);
    			transition_out(selectdivider1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selectdivider0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(selectdivider1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(234:20) {#if showGroupLabels}",
    		ctx
    	});

    	return block;
    }

    // (236:24) <SelectDivider label>
    function create_default_slot_3(ctx) {
    	let t_value = /*item*/ ctx[24].group + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menuItems*/ 2 && t_value !== (t_value = /*item*/ ctx[24].group + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(236:24) <SelectDivider label>",
    		ctx
    	});

    	return block;
    }

    // (230:20) {#if item.group && showGroupLabels}
    function create_if_block_2(ctx) {
    	let current;

    	const selectdivider = new SelectDivider({
    			props: {
    				label: true,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(selectdivider.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(selectdivider, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const selectdivider_changes = {};

    			if (dirty & /*$$scope, menuItems*/ 134217730) {
    				selectdivider_changes.$$scope = { dirty, ctx };
    			}

    			selectdivider.$set(selectdivider_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectdivider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectdivider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selectdivider, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(230:20) {#if item.group && showGroupLabels}",
    		ctx
    	});

    	return block;
    }

    // (231:24) <SelectDivider label>
    function create_default_slot_2(ctx) {
    	let t_value = /*item*/ ctx[24].group + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menuItems*/ 2 && t_value !== (t_value = /*item*/ ctx[24].group + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(231:24) <SelectDivider label>",
    		ctx
    	});

    	return block;
    }

    // (241:16) <SelectItem on:click={menuClick} on:mouseenter={removeHighlight} itemId={item.id} bind:selected={item.selected}>
    function create_default_slot_1(ctx) {
    	let t_value = /*item*/ ctx[24].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menuItems*/ 2 && t_value !== (t_value = /*item*/ ctx[24].label + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(241:16) <SelectItem on:click={menuClick} on:mouseenter={removeHighlight} itemId={item.id} bind:selected={item.selected}>",
    		ctx
    	});

    	return block;
    }

    // (228:12) {#each menuItems as item, i}
    function create_each_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let updating_selected;
    	let current;
    	const if_block_creators = [create_if_block_1, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*i*/ ctx[26] === 0) return 0;
    		if (/*i*/ ctx[26] > 0 && /*item*/ ctx[24].group && /*menuItems*/ ctx[1][/*i*/ ctx[26] - 1].group != /*item*/ ctx[24].group) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_2(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	function selectitem_selected_binding(value_1) {
    		/*selectitem_selected_binding*/ ctx[21].call(null, value_1, /*item*/ ctx[24]);
    	}

    	let selectitem_props = {
    		itemId: /*item*/ ctx[24].id,
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	if (/*item*/ ctx[24].selected !== void 0) {
    		selectitem_props.selected = /*item*/ ctx[24].selected;
    	}

    	const selectitem = new SelectItem({ props: selectitem_props, $$inline: true });
    	binding_callbacks.push(() => bind(selectitem, "selected", selectitem_selected_binding));
    	selectitem.$on("click", /*menuClick*/ ctx[12]);
    	selectitem.$on("mouseenter", removeHighlight);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			create_component(selectitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			mount_component(selectitem, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				} else {
    					if_block = null;
    				}
    			}

    			const selectitem_changes = {};
    			if (dirty & /*menuItems*/ 2) selectitem_changes.itemId = /*item*/ ctx[24].id;

    			if (dirty & /*$$scope, menuItems*/ 134217730) {
    				selectitem_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_selected && dirty & /*menuItems*/ 2) {
    				updating_selected = true;
    				selectitem_changes.selected = /*item*/ ctx[24].selected;
    				add_flush_callback(() => updating_selected = false);
    			}

    			selectitem.$set(selectitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(selectitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(selectitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(t);
    			destroy_component(selectitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(228:12) {#each menuItems as item, i}",
    		ctx
    	});

    	return block;
    }

    // (195:0) <ClickOutside on:clickoutside={menuClick}>
    function create_default_slot(ctx) {
    	let div;
    	let button;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let t1;
    	let t2;
    	let ul;
    	let div_class_value;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block_7, create_if_block_8];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*iconName*/ ctx[4]) return 0;
    		if (/*iconText*/ ctx[5]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	function select_block_type_1(ctx, dirty) {
    		if (/*value*/ ctx[3]) return create_if_block_6;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block1 = current_block_type(ctx);
    	let if_block2 = !/*disabled*/ ctx[0] && create_if_block_5(ctx);
    	let if_block3 = /*menuItems*/ ctx[1].length > 0 && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			ul = element("ul");
    			if (if_block3) if_block3.c();
    			button.disabled = /*disabled*/ ctx[0];
    			attr_dev(button, "class", "svelte-15vif0i");
    			add_location(button, file$7, 205, 8, 6950);
    			attr_dev(ul, "class", "menu hidden svelte-15vif0i");
    			add_location(ul, file$7, 225, 8, 7919);
    			attr_dev(div, "disabled", /*disabled*/ ctx[0]);
    			attr_dev(div, "placeholder", /*placeholder*/ ctx[2]);
    			attr_dev(div, "showgrouplabels", /*showGroupLabels*/ ctx[7]);
    			attr_dev(div, "macosblink", /*macOSBlink*/ ctx[6]);
    			attr_dev(div, "class", div_class_value = "wrapper " + /*className*/ ctx[8] + " svelte-15vif0i");
    			add_location(div, file$7, 195, 4, 6751);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(button, null);
    			}

    			append_dev(button, t0);
    			if_block1.m(button, null);
    			append_dev(button, t1);
    			if (if_block2) if_block2.m(button, null);
    			/*button_binding*/ ctx[20](button);
    			append_dev(div, t2);
    			append_dev(div, ul);
    			if (if_block3) if_block3.m(ul, null);
    			/*ul_binding*/ ctx[22](ul);
    			/*div_binding*/ ctx[23](div);
    			current = true;

    			dispose = [
    				listen_dev(button, "click", /*menuClick*/ ctx[12], false, false, false),
    				listen_dev(div, "change", /*change_handler*/ ctx[19], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block0) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block0 = if_blocks[current_block_type_index];

    					if (!if_block0) {
    						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block0.c();
    					}

    					transition_in(if_block0, 1);
    					if_block0.m(button, t0);
    				} else {
    					if_block0 = null;
    				}
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(button, t1);
    				}
    			}

    			if (!/*disabled*/ ctx[0]) {
    				if (!if_block2) {
    					if_block2 = create_if_block_5(ctx);
    					if_block2.c();
    					if_block2.m(button, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (!current || dirty & /*disabled*/ 1) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[0]);
    			}

    			if (/*menuItems*/ ctx[1].length > 0) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    					transition_in(if_block3, 1);
    				} else {
    					if_block3 = create_if_block$3(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(ul, null);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*disabled*/ 1) {
    				attr_dev(div, "disabled", /*disabled*/ ctx[0]);
    			}

    			if (!current || dirty & /*placeholder*/ 4) {
    				attr_dev(div, "placeholder", /*placeholder*/ ctx[2]);
    			}

    			if (!current || dirty & /*showGroupLabels*/ 128) {
    				attr_dev(div, "showgrouplabels", /*showGroupLabels*/ ctx[7]);
    			}

    			if (!current || dirty & /*macOSBlink*/ 64) {
    				attr_dev(div, "macosblink", /*macOSBlink*/ ctx[6]);
    			}

    			if (!current || dirty & /*className*/ 256 && div_class_value !== (div_class_value = "wrapper " + /*className*/ ctx[8] + " svelte-15vif0i")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if_block1.d();
    			if (if_block2) if_block2.d();
    			/*button_binding*/ ctx[20](null);
    			if (if_block3) if_block3.d();
    			/*ul_binding*/ ctx[22](null);
    			/*div_binding*/ ctx[23](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(195:0) <ClickOutside on:clickoutside={menuClick}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let current;

    	const clickoutside = new Src({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	clickoutside.$on("clickoutside", /*menuClick*/ ctx[12]);

    	const block = {
    		c: function create() {
    			create_component(clickoutside.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(clickoutside, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const clickoutside_changes = {};

    			if (dirty & /*$$scope, disabled, placeholder, showGroupLabels, macOSBlink, className, menuWrapper, menuList, menuItems, menuButton, value, iconName, iconText*/ 134221823) {
    				clickoutside_changes.$$scope = { dirty, ctx };
    			}

    			clickoutside.$set(clickoutside_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(clickoutside.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(clickoutside.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(clickoutside, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function removeHighlight(event) {
    	let items = Array.from(event.target.parentNode.children);

    	items.forEach(item => {
    		item.blur();
    		item.classList.remove("highlight");
    	});
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { iconName = null } = $$props;
    	let { iconText = null } = $$props;
    	let { disabled = false } = $$props;
    	let { macOSBlink = false } = $$props;
    	let { menuItems = [] } = $$props; //pass data in via this prop to generate menu items
    	let { placeholder = "Please make a selection." } = $$props;
    	let { value = null } = $$props; //stores the current selection, note, the value will be an object from your array
    	let { showGroupLabels = false } = $$props; //default prop, true will show option group labels
    	const dispatch = createEventDispatcher();
    	let { class: className = "" } = $$props;
    	let groups = checkGroups();
    	let menuWrapper, menuButton, menuList;

    	//FUNCTIONS
    	//set placeholder
    	if (menuItems.length <= 0) {
    		placeholder = "There are no items to select";
    		disabled = true;
    	}

    	//assign id's to the input array
    	onMount(async () => {
    		updateSelectedAndIds();
    	});

    	// this function runs everytime the menuItems array os updated
    	// it will auto assign ids and keep the value var updated
    	function updateSelectedAndIds() {
    		menuItems.forEach((item, index) => {
    			//update id
    			item["id"] = index;

    			//update selection
    			if (item.selected === true) {
    				$$invalidate(3, value = item);
    			}
    		});
    	}

    	//determine if option groups are present
    	function checkGroups() {
    		let groupCount = 0;

    		if (menuItems) {
    			menuItems.forEach(item => {
    				if (item.group != null) {
    					groupCount++;
    				}
    			});

    			if (groupCount === menuItems.length) {
    				return true;
    			} else {
    				return false;
    			}
    		}

    		return false;
    	}

    	//run for all menu click events
    	//this opens/closes the menu
    	function menuClick(event) {
    		resetMenuProperties();

    		if (!event.target) {
    			menuList.classList.add("hidden");
    		} else if (event.target.contains(menuButton)) {

    			if (value) {
    				//toggle menu
    				menuList.classList.remove("hidden");

    				let id = value.id;
    				let selectedItem = menuList.querySelector("[itemId=\"" + id + "\"]");
    				selectedItem.focus(); //set focus to the currently selected item

    				// calculate distance from top so that we can position the dropdown menu
    				let parentTop = menuList.getBoundingClientRect().top;

    				let itemTop = selectedItem.getBoundingClientRect().top;
    				let topPos = itemTop - parentTop - 3;
    				$$invalidate(11, menuList.style.top = -Math.abs(topPos) + "px", menuList);

    				//update size and position based on plugin UI
    				resizeAndPosition();
    			} else {
    				menuList.classList.remove("hidden");
    				$$invalidate(11, menuList.style.top = "0px", menuList);
    				let firstItem = menuList.querySelector("[itemId=\"0\"]");
    				firstItem.focus();

    				//update size and position based on plugin UI
    				resizeAndPosition();
    			}
    		} else if (menuList.contains(event.target)) {
    			//find selected item in array
    			let itemId = parseInt(event.target.getAttribute("itemId"));

    			//remove current selection if there is one
    			if (value) {
    				$$invalidate(1, menuItems[value.id].selected = false, menuItems);
    			}

    			$$invalidate(1, menuItems[itemId].selected = true, menuItems); //select current item
    			updateSelectedAndIds();
    			dispatch("change", menuItems[itemId]);

    			if (macOSBlink) {
    				var x = 4;
    				var interval = 70;

    				//blink the background
    				for (var i = 0; i < x; i++) {
    					setTimeout(
    						function () {
    							event.target.classList.toggle("blink");
    						},
    						i * interval
    					);
    				}

    				//delay closing the menu
    				setTimeout(
    					function () {
    						menuList.classList.add("hidden"); //hide the menu
    					},
    					interval * x + 40
    				);
    			} else {
    				menuList.classList.add("hidden"); //hide the menu
    				menuButton.classList.remove("selected"); //remove selected state from button
    			}
    		}
    	}

    	// this function ensures that the select menu
    	// fits inside the plugin viewport
    	// if its too big, it will resize it and enable a scrollbar
    	// if its off screen it will shift the position
    	function resizeAndPosition() {
    		//set the max height of the menu based on plugin/iframe window
    		let maxMenuHeight = window.innerHeight - 16;

    		let menuHeight = menuList.offsetHeight;
    		let menuResized = false;

    		if (menuHeight > maxMenuHeight) {
    			$$invalidate(11, menuList.style.height = maxMenuHeight + "px", menuList);
    			menuResized = true;
    		}

    		//lets adjust the position of the menu if its cut off from viewport
    		var bounding = menuList.getBoundingClientRect();

    		var parentBounding = menuButton.getBoundingClientRect();
    		var topLimit = parentBounding.top - 8;

    		if (bounding.top < 0) {
    			$$invalidate(11, menuList.style.top = -Math.abs(parentBounding.top - 8) + "px", menuList);
    		}

    		if (bounding.bottom > (window.innerHeight || document.documentElement.clientHeight)) {
    			let minTop = -Math.abs(parentBounding.top - (window.innerHeight - menuHeight - 8));
    			let newTop = -Math.abs(bounding.bottom - window.innerHeight + 16);

    			if (menuResized) {
    				$$invalidate(11, menuList.style.top = -Math.abs(parentBounding.top - 8) + "px", menuList);
    			} else if (newTop > minTop) {
    				$$invalidate(11, menuList.style.top = minTop + "px", menuList);
    			} else {
    				$$invalidate(11, menuList.style.top = newTop + "px", menuList);
    			}
    		}
    	}

    	function resetMenuProperties() {
    		$$invalidate(11, menuList.style.height = "auto", menuList);
    		$$invalidate(11, menuList.style.top = "0px", menuList);
    	}

    	const writable_props = [
    		"iconName",
    		"iconText",
    		"disabled",
    		"macOSBlink",
    		"menuItems",
    		"placeholder",
    		"value",
    		"showGroupLabels",
    		"class"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SelectMenu> was created with unknown prop '${key}'`);
    	});

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(10, menuButton = $$value);
    		});
    	}

    	function selectitem_selected_binding(value_1, item) {
    		item.selected = value_1;
    		$$invalidate(1, menuItems);
    	}

    	function ul_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(11, menuList = $$value);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(9, menuWrapper = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("iconName" in $$props) $$invalidate(4, iconName = $$props.iconName);
    		if ("iconText" in $$props) $$invalidate(5, iconText = $$props.iconText);
    		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ("macOSBlink" in $$props) $$invalidate(6, macOSBlink = $$props.macOSBlink);
    		if ("menuItems" in $$props) $$invalidate(1, menuItems = $$props.menuItems);
    		if ("placeholder" in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("showGroupLabels" in $$props) $$invalidate(7, showGroupLabels = $$props.showGroupLabels);
    		if ("class" in $$props) $$invalidate(8, className = $$props.class);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		ClickOutside: Src,
    		SelectItem,
    		SelectDivider,
    		Icon,
    		iconName,
    		iconText,
    		disabled,
    		macOSBlink,
    		menuItems,
    		placeholder,
    		value,
    		showGroupLabels,
    		dispatch,
    		className,
    		groups,
    		menuWrapper,
    		menuButton,
    		menuList,
    		updateSelectedAndIds,
    		checkGroups,
    		removeHighlight,
    		menuClick,
    		resizeAndPosition,
    		resetMenuProperties,
    		Array,
    		Math,
    		parseInt,
    		setTimeout,
    		window,
    		document
    	});

    	$$self.$inject_state = $$props => {
    		if ("iconName" in $$props) $$invalidate(4, iconName = $$props.iconName);
    		if ("iconText" in $$props) $$invalidate(5, iconText = $$props.iconText);
    		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ("macOSBlink" in $$props) $$invalidate(6, macOSBlink = $$props.macOSBlink);
    		if ("menuItems" in $$props) $$invalidate(1, menuItems = $$props.menuItems);
    		if ("placeholder" in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("showGroupLabels" in $$props) $$invalidate(7, showGroupLabels = $$props.showGroupLabels);
    		if ("className" in $$props) $$invalidate(8, className = $$props.className);
    		if ("groups" in $$props) groups = $$props.groups;
    		if ("menuWrapper" in $$props) $$invalidate(9, menuWrapper = $$props.menuWrapper);
    		if ("menuButton" in $$props) $$invalidate(10, menuButton = $$props.menuButton);
    		if ("menuList" in $$props) $$invalidate(11, menuList = $$props.menuList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*menuItems*/ 2) {
    			 (updateSelectedAndIds());
    		}
    	};

    	return [
    		disabled,
    		menuItems,
    		placeholder,
    		value,
    		iconName,
    		iconText,
    		macOSBlink,
    		showGroupLabels,
    		className,
    		menuWrapper,
    		menuButton,
    		menuList,
    		menuClick,
    		dispatch,
    		groups,
    		updateSelectedAndIds,
    		checkGroups,
    		resizeAndPosition,
    		resetMenuProperties,
    		change_handler,
    		button_binding,
    		selectitem_selected_binding,
    		ul_binding,
    		div_binding
    	];
    }

    class SelectMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document_1.getElementById("svelte-15vif0i-style")) add_css$6();

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			iconName: 4,
    			iconText: 5,
    			disabled: 0,
    			macOSBlink: 6,
    			menuItems: 1,
    			placeholder: 2,
    			value: 3,
    			showGroupLabels: 7,
    			class: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectMenu",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get iconName() {
    		throw new Error("<SelectMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconName(value) {
    		throw new Error("<SelectMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconText() {
    		throw new Error("<SelectMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconText(value) {
    		throw new Error("<SelectMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<SelectMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<SelectMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get macOSBlink() {
    		throw new Error("<SelectMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set macOSBlink(value) {
    		throw new Error("<SelectMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get menuItems() {
    		throw new Error("<SelectMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menuItems(value) {
    		throw new Error("<SelectMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<SelectMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<SelectMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SelectMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SelectMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showGroupLabels() {
    		throw new Error("<SelectMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showGroupLabels(value) {
    		throw new Error("<SelectMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<SelectMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<SelectMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/PluginUI.svelte generated by Svelte v3.19.0 */

    const file$8 = "src/PluginUI.svelte";

    // (42:1) <Label>
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Shape");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(42:1) <Label>",
    		ctx
    	});

    	return block;
    }

    // (45:1) <Label>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Count");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(45:1) <Label>",
    		ctx
    	});

    	return block;
    }

    // (49:1) <Button on:click={cancel} secondary class="mr-xsmall">
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Cancel");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(49:1) <Button on:click={cancel} secondary class=\\\"mr-xsmall\\\">",
    		ctx
    	});

    	return block;
    }

    // (50:1) <Button on:click={createShapes} primary bind:disabled={disabled}>
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Create shapes");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(50:1) <Button on:click={createShapes} primary bind:disabled={disabled}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div1;
    	let t0;
    	let updating_menuItems;
    	let updating_value;
    	let t1;
    	let t2;
    	let updating_value_1;
    	let t3;
    	let div0;
    	let t4;
    	let updating_disabled;
    	let current;

    	const label0 = new Label({
    			props: {
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function selectmenu_menuItems_binding(value) {
    		/*selectmenu_menuItems_binding*/ ctx[5].call(null, value);
    	}

    	function selectmenu_value_binding(value_1) {
    		/*selectmenu_value_binding*/ ctx[6].call(null, value_1);
    	}

    	let selectmenu_props = { class: "mb-xxsmall" };

    	if (/*menuItems*/ ctx[0] !== void 0) {
    		selectmenu_props.menuItems = /*menuItems*/ ctx[0];
    	}

    	if (/*selectedShape*/ ctx[2] !== void 0) {
    		selectmenu_props.value = /*selectedShape*/ ctx[2];
    	}

    	const selectmenu = new SelectMenu({ props: selectmenu_props, $$inline: true });
    	binding_callbacks.push(() => bind(selectmenu, "menuItems", selectmenu_menuItems_binding));
    	binding_callbacks.push(() => bind(selectmenu, "value", selectmenu_value_binding));

    	const label1 = new Label({
    			props: {
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function input_value_binding(value_2) {
    		/*input_value_binding*/ ctx[7].call(null, value_2);
    	}

    	let input_props = { iconText: "#", class: "mb-xxsmall" };

    	if (/*count*/ ctx[3] !== void 0) {
    		input_props.value = /*count*/ ctx[3];
    	}

    	const input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));

    	const button0 = new Button({
    			props: {
    				secondary: true,
    				class: "mr-xsmall",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", cancel);

    	function button1_disabled_binding(value_3) {
    		/*button1_disabled_binding*/ ctx[8].call(null, value_3);
    	}

    	let button1_props = {
    		primary: true,
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	if (/*disabled*/ ctx[1] !== void 0) {
    		button1_props.disabled = /*disabled*/ ctx[1];
    	}

    	const button1 = new Button({ props: button1_props, $$inline: true });
    	binding_callbacks.push(() => bind(button1, "disabled", button1_disabled_binding));
    	button1.$on("click", /*createShapes*/ ctx[4]);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(label0.$$.fragment);
    			t0 = space();
    			create_component(selectmenu.$$.fragment);
    			t1 = space();
    			create_component(label1.$$.fragment);
    			t2 = space();
    			create_component(input.$$.fragment);
    			t3 = space();
    			div0 = element("div");
    			create_component(button0.$$.fragment);
    			t4 = space();
    			create_component(button1.$$.fragment);
    			attr_dev(div0, "class", "flex p-xxsmall mb-xsmall");
    			add_location(div0, file$8, 47, 1, 1420);
    			attr_dev(div1, "class", "wrapper p-xxsmall");
    			add_location(div1, file$8, 39, 0, 1190);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(label0, div1, null);
    			append_dev(div1, t0);
    			mount_component(selectmenu, div1, null);
    			append_dev(div1, t1);
    			mount_component(label1, div1, null);
    			append_dev(div1, t2);
    			mount_component(input, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			mount_component(button0, div0, null);
    			append_dev(div0, t4);
    			mount_component(button1, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const label0_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				label0_changes.$$scope = { dirty, ctx };
    			}

    			label0.$set(label0_changes);
    			const selectmenu_changes = {};

    			if (!updating_menuItems && dirty & /*menuItems*/ 1) {
    				updating_menuItems = true;
    				selectmenu_changes.menuItems = /*menuItems*/ ctx[0];
    				add_flush_callback(() => updating_menuItems = false);
    			}

    			if (!updating_value && dirty & /*selectedShape*/ 4) {
    				updating_value = true;
    				selectmenu_changes.value = /*selectedShape*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			selectmenu.$set(selectmenu_changes);
    			const label1_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				label1_changes.$$scope = { dirty, ctx };
    			}

    			label1.$set(label1_changes);
    			const input_changes = {};

    			if (!updating_value_1 && dirty & /*count*/ 8) {
    				updating_value_1 = true;
    				input_changes.value = /*count*/ ctx[3];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			input.$set(input_changes);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_disabled && dirty & /*disabled*/ 2) {
    				updating_disabled = true;
    				button1_changes.disabled = /*disabled*/ ctx[1];
    				add_flush_callback(() => updating_disabled = false);
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label0.$$.fragment, local);
    			transition_in(selectmenu.$$.fragment, local);
    			transition_in(label1.$$.fragment, local);
    			transition_in(input.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label0.$$.fragment, local);
    			transition_out(selectmenu.$$.fragment, local);
    			transition_out(label1.$$.fragment, local);
    			transition_out(input.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(label0);
    			destroy_component(selectmenu);
    			destroy_component(label1);
    			destroy_component(input);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function cancel() {
    	parent.postMessage({ pluginMessage: { "type": "cancel" } }, "*");
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let menuItems = [
    		{
    			"value": "rectangle",
    			"label": "Rectangle",
    			"group": null,
    			"selected": false
    		},
    		{
    			"value": "triangle",
    			"label": "Triangle ",
    			"group": null,
    			"selected": false
    		},
    		{
    			"value": "circle",
    			"label": "Circle",
    			"group": null,
    			"selected": false
    		}
    	];

    	var disabled = true;
    	var selectedShape;
    	var count = 5;

    	function createShapes() {
    		parent.postMessage(
    			{
    				pluginMessage: {
    					"type": "create-shapes",
    					count,
    					"shape": selectedShape.value
    				}
    			},
    			"*"
    		);
    	}

    	function selectmenu_menuItems_binding(value) {
    		menuItems = value;
    		$$invalidate(0, menuItems);
    	}

    	function selectmenu_value_binding(value_1) {
    		selectedShape = value_1;
    		$$invalidate(2, selectedShape);
    	}

    	function input_value_binding(value_2) {
    		count = value_2;
    		$$invalidate(3, count);
    	}

    	function button1_disabled_binding(value_3) {
    		disabled = value_3;
    		($$invalidate(1, disabled), $$invalidate(2, selectedShape));
    	}

    	$$self.$capture_state = () => ({
    		GlobalCSS: css,
    		Button,
    		Input,
    		Label,
    		SelectMenu,
    		menuItems,
    		disabled,
    		selectedShape,
    		count,
    		createShapes,
    		cancel,
    		parent
    	});

    	$$self.$inject_state = $$props => {
    		if ("menuItems" in $$props) $$invalidate(0, menuItems = $$props.menuItems);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ("selectedShape" in $$props) $$invalidate(2, selectedShape = $$props.selectedShape);
    		if ("count" in $$props) $$invalidate(3, count = $$props.count);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selectedShape*/ 4) {
    			//this is a reactive variable that will return false when a value is selected from
    			//the select menu, its value is bound to the primary buttons disabled prop
    			 $$invalidate(1, disabled = selectedShape === null);
    		}
    	};

    	return [
    		menuItems,
    		disabled,
    		selectedShape,
    		count,
    		createShapes,
    		selectmenu_menuItems_binding,
    		selectmenu_value_binding,
    		input_value_binding,
    		button1_disabled_binding
    	];
    }

    class PluginUI extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PluginUI",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    const app = new PluginUI({
    	target: document.body,
    });

    return app;

}());
