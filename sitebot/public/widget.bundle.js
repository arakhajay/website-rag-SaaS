(function(){"use strict";var A,m,ie,U,se,le,ae,ce,J,K,Q,T={},ue=[],Me=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,L=Array.isArray;function N(e,t){for(var _ in t)e[_]=t[_];return e}function X(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function Ae(e,t,_){var n,i,r,l={};for(r in t)r=="key"?n=t[r]:r=="ref"?i=t[r]:l[r]=t[r];if(arguments.length>2&&(l.children=arguments.length>3?A.call(arguments,2):_),typeof e=="function"&&e.defaultProps!=null)for(r in e.defaultProps)l[r]===void 0&&(l[r]=e.defaultProps[r]);return F(e,l,n,i,null)}function F(e,t,_,n,i){var r={type:e,props:t,key:_,ref:n,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:i??++ie,__i:-1,__u:0};return i==null&&m.vnode!=null&&m.vnode(r),r}function R(e){return e.children}function W(e,t){this.props=e,this.context=t}function P(e,t){if(t==null)return e.__?P(e.__,e.__i+1):null;for(var _;t<e.__k.length;t++)if((_=e.__k[t])!=null&&_.__e!=null)return _.__e;return typeof e.type=="function"?P(e):null}function de(e){var t,_;if((e=e.__)!=null&&e.__c!=null){for(e.__e=e.__c.base=null,t=0;t<e.__k.length;t++)if((_=e.__k[t])!=null&&_.__e!=null){e.__e=e.__c.base=_.__e;break}return de(e)}}function fe(e){(!e.__d&&(e.__d=!0)&&U.push(e)&&!j.__r++||se!=m.debounceRendering)&&((se=m.debounceRendering)||le)(j)}function j(){for(var e,t,_,n,i,r,l,a=1;U.length;)U.length>a&&U.sort(ae),e=U.shift(),a=U.length,e.__d&&(_=void 0,n=void 0,i=(n=(t=e).__v).__e,r=[],l=[],t.__P&&((_=N({},n)).__v=n.__v+1,m.vnode&&m.vnode(_),Y(t.__P,_,n,t.__n,t.__P.namespaceURI,32&n.__u?[i]:null,r,i??P(n),!!(32&n.__u),l),_.__v=n.__v,_.__.__k[_.__i]=_,be(r,_,l),n.__e=n.__=null,_.__e!=i&&de(_)));j.__r=0}function pe(e,t,_,n,i,r,l,a,u,s,d){var o,f,c,v,w,g,p,h=n&&n.__k||ue,S=t.length;for(u=Le(_,t,h,u,S),o=0;o<S;o++)(c=_.__k[o])!=null&&(f=c.__i==-1?T:h[c.__i]||T,c.__i=o,g=Y(e,c,f,i,r,l,a,u,s,d),v=c.__e,c.ref&&f.ref!=c.ref&&(f.ref&&ee(f.ref,null,c),d.push(c.ref,c.__c||v,c)),w==null&&v!=null&&(w=v),(p=!!(4&c.__u))||f.__k===c.__k?u=he(c,u,e,p):typeof c.type=="function"&&g!==void 0?u=g:v&&(u=v.nextSibling),c.__u&=-7);return _.__e=w,u}function Le(e,t,_,n,i){var r,l,a,u,s,d=_.length,o=d,f=0;for(e.__k=new Array(i),r=0;r<i;r++)(l=t[r])!=null&&typeof l!="boolean"&&typeof l!="function"?(typeof l=="string"||typeof l=="number"||typeof l=="bigint"||l.constructor==String?l=e.__k[r]=F(null,l,null,null,null):L(l)?l=e.__k[r]=F(R,{children:l},null,null,null):l.constructor===void 0&&l.__b>0?l=e.__k[r]=F(l.type,l.props,l.key,l.ref?l.ref:null,l.__v):e.__k[r]=l,u=r+f,l.__=e,l.__b=e.__b+1,a=null,(s=l.__i=Fe(l,_,u,o))!=-1&&(o--,(a=_[s])&&(a.__u|=2)),a==null||a.__v==null?(s==-1&&(i>d?f--:i<d&&f++),typeof l.type!="function"&&(l.__u|=4)):s!=u&&(s==u-1?f--:s==u+1?f++:(s>u?f--:f++,l.__u|=4))):e.__k[r]=null;if(o)for(r=0;r<d;r++)(a=_[r])!=null&&(2&a.__u)==0&&(a.__e==n&&(n=P(a)),ye(a,a));return n}function he(e,t,_,n){var i,r;if(typeof e.type=="function"){for(i=e.__k,r=0;i&&r<i.length;r++)i[r]&&(i[r].__=e,t=he(i[r],t,_,n));return t}e.__e!=t&&(n&&(t&&e.type&&!t.parentNode&&(t=P(e)),_.insertBefore(e.__e,t||null)),t=e.__e);do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function Fe(e,t,_,n){var i,r,l,a=e.key,u=e.type,s=t[_],d=s!=null&&(2&s.__u)==0;if(s===null&&a==null||d&&a==s.key&&u==s.type)return _;if(n>(d?1:0)){for(i=_-1,r=_+1;i>=0||r<t.length;)if((s=t[l=i>=0?i--:r++])!=null&&(2&s.__u)==0&&a==s.key&&u==s.type)return l}return-1}function me(e,t,_){t[0]=="-"?e.setProperty(t,_??""):e[t]=_==null?"":typeof _!="number"||Me.test(t)?_:_+"px"}function V(e,t,_,n,i){var r,l;e:if(t=="style")if(typeof _=="string")e.style.cssText=_;else{if(typeof n=="string"&&(e.style.cssText=n=""),n)for(t in n)_&&t in _||me(e.style,t,"");if(_)for(t in _)n&&_[t]==n[t]||me(e.style,t,_[t])}else if(t[0]=="o"&&t[1]=="n")r=t!=(t=t.replace(ce,"$1")),l=t.toLowerCase(),t=l in e||t=="onFocusOut"||t=="onFocusIn"?l.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+r]=_,_?n?_.u=n.u:(_.u=J,e.addEventListener(t,r?Q:K,r)):e.removeEventListener(t,r?Q:K,r);else{if(i=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=_??"";break e}catch{}typeof _=="function"||(_==null||_===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&_==1?"":_))}}function ve(e){return function(t){if(this.l){var _=this.l[t.type+e];if(t.t==null)t.t=J++;else if(t.t<_.u)return;return _(m.event?m.event(t):t)}}}function Y(e,t,_,n,i,r,l,a,u,s){var d,o,f,c,v,w,g,p,h,S,H,C,I,Ie,G,M,re,$=t.type;if(t.constructor!==void 0)return null;128&_.__u&&(u=!!(32&_.__u),r=[a=t.__e=_.__e]),(d=m.__b)&&d(t);e:if(typeof $=="function")try{if(p=t.props,h="prototype"in $&&$.prototype.render,S=(d=$.contextType)&&n[d.__c],H=d?S?S.props.value:d.__:n,_.__c?g=(o=t.__c=_.__c).__=o.__E:(h?t.__c=o=new $(p,H):(t.__c=o=new W(p,H),o.constructor=$,o.render=We),S&&S.sub(o),o.state||(o.state={}),o.__n=n,f=o.__d=!0,o.__h=[],o._sb=[]),h&&o.__s==null&&(o.__s=o.state),h&&$.getDerivedStateFromProps!=null&&(o.__s==o.state&&(o.__s=N({},o.__s)),N(o.__s,$.getDerivedStateFromProps(p,o.__s))),c=o.props,v=o.state,o.__v=t,f)h&&$.getDerivedStateFromProps==null&&o.componentWillMount!=null&&o.componentWillMount(),h&&o.componentDidMount!=null&&o.__h.push(o.componentDidMount);else{if(h&&$.getDerivedStateFromProps==null&&p!==c&&o.componentWillReceiveProps!=null&&o.componentWillReceiveProps(p,H),t.__v==_.__v||!o.__e&&o.shouldComponentUpdate!=null&&o.shouldComponentUpdate(p,o.__s,H)===!1){for(t.__v!=_.__v&&(o.props=p,o.state=o.__s,o.__d=!1),t.__e=_.__e,t.__k=_.__k,t.__k.some(function(E){E&&(E.__=t)}),C=0;C<o._sb.length;C++)o.__h.push(o._sb[C]);o._sb=[],o.__h.length&&l.push(o);break e}o.componentWillUpdate!=null&&o.componentWillUpdate(p,o.__s,H),h&&o.componentDidUpdate!=null&&o.__h.push(function(){o.componentDidUpdate(c,v,w)})}if(o.context=H,o.props=p,o.__P=e,o.__e=!1,I=m.__r,Ie=0,h){for(o.state=o.__s,o.__d=!1,I&&I(t),d=o.render(o.props,o.state,o.context),G=0;G<o._sb.length;G++)o.__h.push(o._sb[G]);o._sb=[]}else do o.__d=!1,I&&I(t),d=o.render(o.props,o.state,o.context),o.state=o.__s;while(o.__d&&++Ie<25);o.state=o.__s,o.getChildContext!=null&&(n=N(N({},n),o.getChildContext())),h&&!f&&o.getSnapshotBeforeUpdate!=null&&(w=o.getSnapshotBeforeUpdate(c,v)),M=d,d!=null&&d.type===R&&d.key==null&&(M=ge(d.props.children)),a=pe(e,L(M)?M:[M],t,_,n,i,r,l,a,u,s),o.base=t.__e,t.__u&=-161,o.__h.length&&l.push(o),g&&(o.__E=o.__=null)}catch(E){if(t.__v=null,u||r!=null)if(E.then){for(t.__u|=u?160:128;a&&a.nodeType==8&&a.nextSibling;)a=a.nextSibling;r[r.indexOf(a)]=null,t.__e=a}else{for(re=r.length;re--;)X(r[re]);Z(t)}else t.__e=_.__e,t.__k=_.__k,E.then||Z(t);m.__e(E,t,_)}else r==null&&t.__v==_.__v?(t.__k=_.__k,t.__e=_.__e):a=t.__e=Re(_.__e,t,_,n,i,r,l,u,s);return(d=m.diffed)&&d(t),128&t.__u?void 0:a}function Z(e){e&&e.__c&&(e.__c.__e=!0),e&&e.__k&&e.__k.forEach(Z)}function be(e,t,_){for(var n=0;n<_.length;n++)ee(_[n],_[++n],_[++n]);m.__c&&m.__c(t,e),e.some(function(i){try{e=i.__h,i.__h=[],e.some(function(r){r.call(i)})}catch(r){m.__e(r,i.__v)}})}function ge(e){return typeof e!="object"||e==null||e.__b&&e.__b>0?e:L(e)?e.map(ge):N({},e)}function Re(e,t,_,n,i,r,l,a,u){var s,d,o,f,c,v,w,g=_.props||T,p=t.props,h=t.type;if(h=="svg"?i="http://www.w3.org/2000/svg":h=="math"?i="http://www.w3.org/1998/Math/MathML":i||(i="http://www.w3.org/1999/xhtml"),r!=null){for(s=0;s<r.length;s++)if((c=r[s])&&"setAttribute"in c==!!h&&(h?c.localName==h:c.nodeType==3)){e=c,r[s]=null;break}}if(e==null){if(h==null)return document.createTextNode(p);e=document.createElementNS(i,h,p.is&&p),a&&(m.__m&&m.__m(t,r),a=!1),r=null}if(h==null)g===p||a&&e.data==p||(e.data=p);else{if(r=r&&A.call(e.childNodes),!a&&r!=null)for(g={},s=0;s<e.attributes.length;s++)g[(c=e.attributes[s]).name]=c.value;for(s in g)if(c=g[s],s!="children"){if(s=="dangerouslySetInnerHTML")o=c;else if(!(s in p)){if(s=="value"&&"defaultValue"in p||s=="checked"&&"defaultChecked"in p)continue;V(e,s,null,c,i)}}for(s in p)c=p[s],s=="children"?f=c:s=="dangerouslySetInnerHTML"?d=c:s=="value"?v=c:s=="checked"?w=c:a&&typeof c!="function"||g[s]===c||V(e,s,c,g[s],i);if(d)a||o&&(d.__html==o.__html||d.__html==e.innerHTML)||(e.innerHTML=d.__html),t.__k=[];else if(o&&(e.innerHTML=""),pe(t.type=="template"?e.content:e,L(f)?f:[f],t,_,n,h=="foreignObject"?"http://www.w3.org/1999/xhtml":i,r,l,r?r[0]:_.__k&&P(_,0),a,u),r!=null)for(s=r.length;s--;)X(r[s]);a||(s="value",h=="progress"&&v==null?e.removeAttribute("value"):v!=null&&(v!==e[s]||h=="progress"&&!v||h=="option"&&v!=g[s])&&V(e,s,v,g[s],i),s="checked",w!=null&&w!=e[s]&&V(e,s,w,g[s],i))}return e}function ee(e,t,_){try{if(typeof e=="function"){var n=typeof e.__u=="function";n&&e.__u(),n&&t==null||(e.__u=e(t))}else e.current=t}catch(i){m.__e(i,_)}}function ye(e,t,_){var n,i;if(m.unmount&&m.unmount(e),(n=e.ref)&&(n.current&&n.current!=e.__e||ee(n,null,t)),(n=e.__c)!=null){if(n.componentWillUnmount)try{n.componentWillUnmount()}catch(r){m.__e(r,t)}n.base=n.__P=null}if(n=e.__k)for(i=0;i<n.length;i++)n[i]&&ye(n[i],t,_||typeof e.type!="function");_||X(e.__e),e.__c=e.__=e.__e=void 0}function We(e,t,_){return this.constructor(e,_)}function je(e,t,_){var n,i,r,l;t==document&&(t=document.documentElement),m.__&&m.__(e,t),i=(n=!1)?null:t.__k,r=[],l=[],Y(t,e=t.__k=Ae(R,null,[e]),i||T,T,t.namespaceURI,i?null:t.firstChild?A.call(t.childNodes):null,r,i?i.__e:t.firstChild,n,l),be(r,e,l)}A=ue.slice,m={__e:function(e,t,_,n){for(var i,r,l;t=t.__;)if((i=t.__c)&&!i.__)try{if((r=i.constructor)&&r.getDerivedStateFromError!=null&&(i.setState(r.getDerivedStateFromError(e)),l=i.__d),i.componentDidCatch!=null&&(i.componentDidCatch(e,n||{}),l=i.__d),l)return i.__E=i}catch(a){e=a}throw e}},ie=0,W.prototype.setState=function(e,t){var _;_=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=N({},this.state),typeof e=="function"&&(e=e(N({},_),this.props)),e&&N(_,e),e!=null&&this.__v&&(t&&this._sb.push(t),fe(this))},W.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),fe(this))},W.prototype.render=R,U=[],le=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,ae=function(e,t){return e.__v.__b-t.__v.__b},j.__r=0,ce=/(PointerCapture)$|Capture$/i,J=0,K=ve(!1),Q=ve(!0);var Ve=0;function y(e,t,_,n,i,r){t||(t={});var l,a,u=t;if("ref"in u)for(a in u={},t)a=="ref"?l=t[a]:u[a]=t[a];var s={type:e,props:u,key:_,ref:l,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--Ve,__i:-1,__u:0,__source:i,__self:r};if(typeof e=="function"&&(l=e.defaultProps))for(a in l)u[a]===void 0&&(u[a]=l[a]);return m.vnode&&m.vnode(s),s}var D,b,te,xe,z=0,ke=[],x=m,we=x.__b,Se=x.__r,$e=x.diffed,Ne=x.__c,He=x.unmount,Ce=x.__;function _e(e,t){x.__h&&x.__h(b,e,z||t),z=0;var _=b.__H||(b.__H={__:[],__h:[]});return e>=_.__.length&&_.__.push({}),_.__[e]}function B(e){return z=1,ze(Ee,e)}function ze(e,t,_){var n=_e(D++,2);if(n.t=e,!n.__c&&(n.__=[Ee(void 0,t),function(a){var u=n.__N?n.__N[0]:n.__[0],s=n.t(u,a);u!==s&&(n.__N=[s,n.__[1]],n.__c.setState({}))}],n.__c=b,!b.__f)){var i=function(a,u,s){if(!n.__c.__H)return!0;var d=n.__c.__H.__.filter(function(f){return!!f.__c});if(d.every(function(f){return!f.__N}))return!r||r.call(this,a,u,s);var o=n.__c.props!==a;return d.forEach(function(f){if(f.__N){var c=f.__[0];f.__=f.__N,f.__N=void 0,c!==f.__[0]&&(o=!0)}}),r&&r.call(this,a,u,s)||o};b.__f=!0;var r=b.shouldComponentUpdate,l=b.componentWillUpdate;b.componentWillUpdate=function(a,u,s){if(this.__e){var d=r;r=void 0,i(a,u,s),r=d}l&&l.call(this,a,u,s)},b.shouldComponentUpdate=i}return n.__N||n.__}function Be(e,t){var _=_e(D++,3);!x.__s&&Pe(_.__H,t)&&(_.__=e,_.u=t,b.__H.__h.push(_))}function Oe(e){return z=5,qe(function(){return{current:e}},[])}function qe(e,t){var _=_e(D++,7);return Pe(_.__H,t)&&(_.__=e(),_.__H=t,_.__h=e),_.__}function Ge(){for(var e;e=ke.shift();)if(e.__P&&e.__H)try{e.__H.__h.forEach(O),e.__H.__h.forEach(ne),e.__H.__h=[]}catch(t){e.__H.__h=[],x.__e(t,e.__v)}}x.__b=function(e){b=null,we&&we(e)},x.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),Ce&&Ce(e,t)},x.__r=function(e){Se&&Se(e),D=0;var t=(b=e.__c).__H;t&&(te===b?(t.__h=[],b.__h=[],t.__.forEach(function(_){_.__N&&(_.__=_.__N),_.u=_.__N=void 0})):(t.__h.forEach(O),t.__h.forEach(ne),t.__h=[],D=0)),te=b},x.diffed=function(e){$e&&$e(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(ke.push(t)!==1&&xe===x.requestAnimationFrame||((xe=x.requestAnimationFrame)||Je)(Ge)),t.__H.__.forEach(function(_){_.u&&(_.__H=_.u),_.u=void 0})),te=b=null},x.__c=function(e,t){t.some(function(_){try{_.__h.forEach(O),_.__h=_.__h.filter(function(n){return!n.__||ne(n)})}catch(n){t.some(function(i){i.__h&&(i.__h=[])}),t=[],x.__e(n,_.__v)}}),Ne&&Ne(e,t)},x.unmount=function(e){He&&He(e);var t,_=e.__c;_&&_.__H&&(_.__H.__.forEach(function(n){try{O(n)}catch(i){t=i}}),_.__H=void 0,t&&x.__e(t,_.__v))};var Ue=typeof requestAnimationFrame=="function";function Je(e){var t,_=function(){clearTimeout(n),Ue&&cancelAnimationFrame(t),setTimeout(e)},n=setTimeout(_,35);Ue&&(t=requestAnimationFrame(_))}function O(e){var t=b,_=e.__c;typeof _=="function"&&(e.__c=void 0,_()),b=t}function ne(e){var t=b;e.__c=e.__(),b=t}function Pe(e,t){return!e||e.length!==t.length||t.some(function(_,n){return _!==e[n]})}function Ee(e,t){return typeof t=="function"?t(e):t}for(var k=[],oe=0;oe<256;++oe)k.push((oe+256).toString(16).slice(1));function Ke(e,t=0){return(k[e[t+0]]+k[e[t+1]]+k[e[t+2]]+k[e[t+3]]+"-"+k[e[t+4]]+k[e[t+5]]+"-"+k[e[t+6]]+k[e[t+7]]+"-"+k[e[t+8]]+k[e[t+9]]+"-"+k[e[t+10]]+k[e[t+11]]+k[e[t+12]]+k[e[t+13]]+k[e[t+14]]+k[e[t+15]]).toLowerCase()}var q,Qe=new Uint8Array(16);function Xe(){if(!q&&(q=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!q))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return q(Qe)}var Ye=typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto);const Te={randomUUID:Ye};function Ze(e,t,_){if(Te.randomUUID&&!e)return Te.randomUUID();e=e||{};var n=e.random||(e.rng||Xe)();return n[6]=n[6]&15|64,n[8]=n[8]&63|128,Ke(n)}const et=`
  .sitebot-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  .sitebot-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #000;
    color: #fff;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  }
  .sitebot-button:hover {
    transform: scale(1.05);
  }
  .sitebot-window {
    position: absolute;
    bottom: 80px;
    right: 0;
    width: 350px;
    height: 500px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: opacity 0.2s, transform 0.2s;
    transform-origin: bottom right;
  }
  .sitebot-header {
    padding: 16px;
    background: #f4f4f5;
    border-bottom: 1px solid #e4e4e7;
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .sitebot-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .sitebot-message {
    max-width: 80%;
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.5;
  }
  .sitebot-message.user {
    background: #000;
    color: #fff;
    align-self: flex-end;
    border-bottom-right-radius: 2px;
  }
  .sitebot-message.ai {
    background: #f4f4f5;
    color: #000;
    align-self: flex-start;
    border-bottom-left-radius: 2px;
  }
  .sitebot-input-area {
    padding: 16px;
    border-top: 1px solid #e4e4e7;
    display: flex;
    gap: 8px;
  }
  .sitebot-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #e4e4e7;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
  }
  .sitebot-input:focus {
    border-color: #000;
  }
  .sitebot-send {
    background: #000;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0 16px;
    font-size: 14px;
    cursor: pointer;
  }
  .sitebot-close {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: #555;
  }
`;function tt({chatbotId:e}){const[t,_]=B(!1),[n,i]=B([{role:"ai",content:"Hi! How can I help you today?"}]),[r,l]=B(""),[a,u]=B(!1),s=Oe(null);Be(()=>{s.current?.scrollIntoView({behavior:"smooth"})},[n]);const d=async o=>{if(o.preventDefault(),!r.trim())return;const f={role:"user",content:r};i(c=>[...c,f]),l(""),u(!0);try{const c=await fetch("http://localhost:3000/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[...n,f],chatbotId:e})});if(!c.body)throw new Error("No response body");const v=c.body.getReader(),w=new TextDecoder;let g={role:"ai",content:""};for(i(p=>[...p,g]);;){const{done:p,value:h}=await v.read();if(p)break;const S=w.decode(h);g.content+=S,i(H=>{const C=[...H];return C[C.length-1]={...g},C})}}catch(c){console.error("Chat error:",c),i(v=>[...v,{role:"ai",content:"Sorry, something went wrong."}])}finally{u(!1)}};return y("div",{className:"sitebot-widget",children:[t&&y("div",{className:"sitebot-window",children:[y("div",{className:"sitebot-header",children:[y("span",{children:"Chat Support"}),y("button",{className:"sitebot-close",onClick:()=>_(!1),children:"×"})]}),y("div",{className:"sitebot-messages",children:[n.map((o,f)=>y("div",{className:`sitebot-message ${o.role}`,children:o.content},f)),a&&y("div",{className:"sitebot-message ai",children:"..."}),y("div",{ref:s})]}),y("form",{className:"sitebot-input-area",onSubmit:d,children:[y("input",{className:"sitebot-input",value:r,onInput:o=>l(o.target.value),placeholder:"Type a message..."}),y("button",{className:"sitebot-send",type:"submit",children:"Send"})]})]}),y("button",{className:"sitebot-button",onClick:()=>_(!t),children:t?y("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[y("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),y("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]}):y("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:y("path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"})})}),y("style",{children:et})]})}const De=document.currentScript?.getAttribute("data-chatbot-id");if(De){const e=document.createElement("div");e.id=`sitebot-${Ze()}`,document.body.appendChild(e);const t=e.attachShadow({mode:"open"});je(y(tt,{chatbotId:De}),t)}else console.error("Sitebot: No chatbot ID found. Please add data-chatbot-id attribute to the script tag.")})();
