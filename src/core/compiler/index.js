import {
    isTextNode,
    isElementNode,
    toDOM,
} from './utils';
import parse from './parse';
import Directive from '../directive';

export default class Compiler {
    constructor(me) {
        this.me = me;
        this.$template = this.me.$options.template ? this.me.$options.template : '';
        this.$el = this.me.$options.el;
        this.compile();
    }

    compile() {
        this.$el = toDOM(this.$el, this.$template);
        this.$fragment = this.toFragment(this.$el);
        this.compileNodes(this.$fragment);
        this.mount();
    }

    mount() {
        this.$el.appendChild(this.$fragment);
    }

    compileNodes(node) {
        let childNodes = [...node.childNodes];

        childNodes.map(node => {
            if (isTextNode(node)) this.compileTextNodes(node);
            if (isElementNode(node)) this.compileElementNodes(node);
            if (node.childNodes && node.childNodes.length) this.compileNodes(node);
        });
    }

    compileTextNodes(node) {
        const segments = parse.text(node.textContent);
        if (!segments.length) return;
        segments.map(segment => {
            // if directive text node.
            if (segment.isDirective) {
                const el = document.createTextNode('');
                node.parentNode.insertBefore(el, node);
                this.bindDirective(el, 'text', segment.value);
            } else {
                // common text node
                node.parentNode.insertBefore(document.createTextNode(segment.value), node);
            }
        });

        node.parentNode.removeChild(node);
    }

    compileElementNodes(node) {
        if (!node.hasAttributes()) return;

        let attributes = [...node.attributes],
            attrName = ``,
            directiveName = ``,
            expression = ``;

        attributes.map(attribute => {
            attrName = attribute.name;
            expression = attribute.value.trim();

            if (attrName.indexOf(':') === 0) {
                directiveName = attrName.slice(1);
                this.bindDirective(node, directiveName, expression);
            } else {
                this.bindAttribute(node, attribute);
            }

            node.removeAttribute(attrName);
        });
    }

    bindDirective(node, name, expression, payload) {
        this.me._directives.push(new Directive(name, node, this.me, expression, payload));
    }

    bindAttribute(node, attribute) {
        const segments = parse.text(attribute.value);
        if (!segments.length) return;
        this.bindDirective(node, 'attribute', segments[0].value, {
            attrName: attribute.name,
        });
    }

    toFragment(node) {
        let fragment = document.createDocumentFragment(),
            child;

        while (child = node.firstChild) {
            fragment.appendChild(child);
        }

        return fragment;
    }
}
