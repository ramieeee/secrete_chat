"use strict";var os=Object.create;var oe=Object.defineProperty;var as=Object.getOwnPropertyDescriptor;var ls=Object.getOwnPropertyNames;var cs=Object.getPrototypeOf,hs=Object.prototype.hasOwnProperty;var v=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),fs=(t,e)=>{for(var s in e)oe(t,s,{get:e[s],enumerable:!0})},Je=(t,e,s,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of ls(e))!hs.call(t,r)&&r!==s&&oe(t,r,{get:()=>e[r],enumerable:!(i=as(e,r))||i.enumerable});return t};var V=(t,e,s)=>(s=t!=null?os(cs(t)):{},Je(e||!t||!t.__esModule?oe(s,"default",{value:t,enumerable:!0}):s,t)),ds=t=>Je(oe({},"__esModule",{value:!0}),t);var T=v((Ar,tt)=>{"use strict";var Qe=["nodebuffer","arraybuffer","fragments"],et=typeof Blob<"u";et&&Qe.push("blob");tt.exports={BINARY_TYPES:Qe,EMPTY_BUFFER:Buffer.alloc(0),GUID:"258EAFA5-E914-47DA-95CA-C5AB0DC85B11",hasBlob:et,kForOnEventAttribute:Symbol("kIsForOnEventAttribute"),kListener:Symbol("kListener"),kStatusCode:Symbol("status-code"),kWebSocket:Symbol("websocket"),NOOP:()=>{}}});var J=v((Fr,ae)=>{"use strict";var{EMPTY_BUFFER:us}=T(),ke=Buffer[Symbol.species];function ps(t,e){if(t.length===0)return us;if(t.length===1)return t[0];let s=Buffer.allocUnsafe(e),i=0;for(let r=0;r<t.length;r++){let n=t[r];s.set(n,i),i+=n.length}return i<e?new ke(s.buffer,s.byteOffset,i):s}function st(t,e,s,i,r){for(let n=0;n<r;n++)s[i+n]=t[n]^e[n&3]}function rt(t,e){for(let s=0;s<t.length;s++)t[s]^=e[s&3]}function _s(t){return t.length===t.buffer.byteLength?t.buffer:t.buffer.slice(t.byteOffset,t.byteOffset+t.length)}function Ce(t){if(Ce.readOnly=!0,Buffer.isBuffer(t))return t;let e;return t instanceof ArrayBuffer?e=new ke(t):ArrayBuffer.isView(t)?e=new ke(t.buffer,t.byteOffset,t.byteLength):(e=Buffer.from(t),Ce.readOnly=!1),e}ae.exports={concat:ps,mask:st,toArrayBuffer:_s,toBuffer:Ce,unmask:rt};if(!process.env.WS_NO_BUFFER_UTIL)try{let t=require("bufferutil");ae.exports.mask=function(e,s,i,r,n){n<48?st(e,s,i,r,n):t.mask(e,s,i,r,n)},ae.exports.unmask=function(e,s){e.length<32?rt(e,s):t.unmask(e,s)}}catch{}});var ot=v(($r,nt)=>{"use strict";var it=Symbol("kDone"),Oe=Symbol("kRun"),Te=class{constructor(e){this[it]=()=>{this.pending--,this[Oe]()},this.concurrency=e||1/0,this.jobs=[],this.pending=0}add(e){this.jobs.push(e),this[Oe]()}[Oe](){if(this.pending!==this.concurrency&&this.jobs.length){let e=this.jobs.shift();this.pending++,e(this[it])}}};nt.exports=Te});var ee=v((Vr,ht)=>{"use strict";var Q=require("zlib"),at=J(),ms=ot(),{kStatusCode:lt}=T(),gs=Buffer[Symbol.species],ys=Buffer.from([0,0,255,255]),ce=Symbol("permessage-deflate"),L=Symbol("total-length"),q=Symbol("callback"),P=Symbol("buffers"),j=Symbol("error"),le,Le=class{constructor(e,s,i){if(this._maxPayload=i|0,this._options=e||{},this._threshold=this._options.threshold!==void 0?this._options.threshold:1024,this._isServer=!!s,this._deflate=null,this._inflate=null,this.params=null,!le){let r=this._options.concurrencyLimit!==void 0?this._options.concurrencyLimit:10;le=new ms(r)}}static get extensionName(){return"permessage-deflate"}offer(){let e={};return this._options.serverNoContextTakeover&&(e.server_no_context_takeover=!0),this._options.clientNoContextTakeover&&(e.client_no_context_takeover=!0),this._options.serverMaxWindowBits&&(e.server_max_window_bits=this._options.serverMaxWindowBits),this._options.clientMaxWindowBits?e.client_max_window_bits=this._options.clientMaxWindowBits:this._options.clientMaxWindowBits==null&&(e.client_max_window_bits=!0),e}accept(e){return e=this.normalizeParams(e),this.params=this._isServer?this.acceptAsServer(e):this.acceptAsClient(e),this.params}cleanup(){if(this._inflate&&(this._inflate.close(),this._inflate=null),this._deflate){let e=this._deflate[q];this._deflate.close(),this._deflate=null,e&&e(new Error("The deflate stream was closed while data was being processed"))}}acceptAsServer(e){let s=this._options,i=e.find(r=>!(s.serverNoContextTakeover===!1&&r.server_no_context_takeover||r.server_max_window_bits&&(s.serverMaxWindowBits===!1||typeof s.serverMaxWindowBits=="number"&&s.serverMaxWindowBits>r.server_max_window_bits)||typeof s.clientMaxWindowBits=="number"&&!r.client_max_window_bits));if(!i)throw new Error("None of the extension offers can be accepted");return s.serverNoContextTakeover&&(i.server_no_context_takeover=!0),s.clientNoContextTakeover&&(i.client_no_context_takeover=!0),typeof s.serverMaxWindowBits=="number"&&(i.server_max_window_bits=s.serverMaxWindowBits),typeof s.clientMaxWindowBits=="number"?i.client_max_window_bits=s.clientMaxWindowBits:(i.client_max_window_bits===!0||s.clientMaxWindowBits===!1)&&delete i.client_max_window_bits,i}acceptAsClient(e){let s=e[0];if(this._options.clientNoContextTakeover===!1&&s.client_no_context_takeover)throw new Error('Unexpected parameter "client_no_context_takeover"');if(!s.client_max_window_bits)typeof this._options.clientMaxWindowBits=="number"&&(s.client_max_window_bits=this._options.clientMaxWindowBits);else if(this._options.clientMaxWindowBits===!1||typeof this._options.clientMaxWindowBits=="number"&&s.client_max_window_bits>this._options.clientMaxWindowBits)throw new Error('Unexpected or invalid parameter "client_max_window_bits"');return s}normalizeParams(e){return e.forEach(s=>{Object.keys(s).forEach(i=>{let r=s[i];if(r.length>1)throw new Error(`Parameter "${i}" must have only a single value`);if(r=r[0],i==="client_max_window_bits"){if(r!==!0){let n=+r;if(!Number.isInteger(n)||n<8||n>15)throw new TypeError(`Invalid value for parameter "${i}": ${r}`);r=n}else if(!this._isServer)throw new TypeError(`Invalid value for parameter "${i}": ${r}`)}else if(i==="server_max_window_bits"){let n=+r;if(!Number.isInteger(n)||n<8||n>15)throw new TypeError(`Invalid value for parameter "${i}": ${r}`);r=n}else if(i==="client_no_context_takeover"||i==="server_no_context_takeover"){if(r!==!0)throw new TypeError(`Invalid value for parameter "${i}": ${r}`)}else throw new Error(`Unknown parameter "${i}"`);s[i]=r})}),e}decompress(e,s,i){le.add(r=>{this._decompress(e,s,(n,o)=>{r(),i(n,o)})})}compress(e,s,i){le.add(r=>{this._compress(e,s,(n,o)=>{r(),i(n,o)})})}_decompress(e,s,i){let r=this._isServer?"client":"server";if(!this._inflate){let n=`${r}_max_window_bits`,o=typeof this.params[n]!="number"?Q.Z_DEFAULT_WINDOWBITS:this.params[n];this._inflate=Q.createInflateRaw({...this._options.zlibInflateOptions,windowBits:o}),this._inflate[ce]=this,this._inflate[L]=0,this._inflate[P]=[],this._inflate.on("error",vs),this._inflate.on("data",ct)}this._inflate[q]=i,this._inflate.write(e),s&&this._inflate.write(ys),this._inflate.flush(()=>{let n=this._inflate[j];if(n){this._inflate.close(),this._inflate=null,i(n);return}let o=at.concat(this._inflate[P],this._inflate[L]);this._inflate._readableState.endEmitted?(this._inflate.close(),this._inflate=null):(this._inflate[L]=0,this._inflate[P]=[],s&&this.params[`${r}_no_context_takeover`]&&this._inflate.reset()),i(null,o)})}_compress(e,s,i){let r=this._isServer?"server":"client";if(!this._deflate){let n=`${r}_max_window_bits`,o=typeof this.params[n]!="number"?Q.Z_DEFAULT_WINDOWBITS:this.params[n];this._deflate=Q.createDeflateRaw({...this._options.zlibDeflateOptions,windowBits:o}),this._deflate[L]=0,this._deflate[P]=[],this._deflate.on("data",xs)}this._deflate[q]=i,this._deflate.write(e),this._deflate.flush(Q.Z_SYNC_FLUSH,()=>{if(!this._deflate)return;let n=at.concat(this._deflate[P],this._deflate[L]);s&&(n=new gs(n.buffer,n.byteOffset,n.length-4)),this._deflate[q]=null,this._deflate[L]=0,this._deflate[P]=[],s&&this.params[`${r}_no_context_takeover`]&&this._deflate.reset(),i(null,n)})}};ht.exports=Le;function xs(t){this[P].push(t),this[L]+=t.length}function ct(t){if(this[L]+=t.length,this[ce]._maxPayload<1||this[L]<=this[ce]._maxPayload){this[P].push(t);return}this[j]=new RangeError("Max payload size exceeded"),this[j].code="WS_ERR_UNSUPPORTED_MESSAGE_LENGTH",this[j][lt]=1009,this.removeListener("data",ct),this.reset()}function vs(t){if(this[ce]._inflate=null,this[j]){this[q](this[j]);return}t[lt]=1007,this[q](t)}});var G=v((qr,he)=>{"use strict";var{isUtf8:ft}=require("buffer"),{hasBlob:bs}=T(),Ss=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,1,1,0,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0];function ws(t){return t>=1e3&&t<=1014&&t!==1004&&t!==1005&&t!==1006||t>=3e3&&t<=4999}function Ne(t){let e=t.length,s=0;for(;s<e;)if((t[s]&128)===0)s++;else if((t[s]&224)===192){if(s+1===e||(t[s+1]&192)!==128||(t[s]&254)===192)return!1;s+=2}else if((t[s]&240)===224){if(s+2>=e||(t[s+1]&192)!==128||(t[s+2]&192)!==128||t[s]===224&&(t[s+1]&224)===128||t[s]===237&&(t[s+1]&224)===160)return!1;s+=3}else if((t[s]&248)===240){if(s+3>=e||(t[s+1]&192)!==128||(t[s+2]&192)!==128||(t[s+3]&192)!==128||t[s]===240&&(t[s+1]&240)===128||t[s]===244&&t[s+1]>143||t[s]>244)return!1;s+=4}else return!1;return!0}function Es(t){return bs&&typeof t=="object"&&typeof t.arrayBuffer=="function"&&typeof t.type=="string"&&typeof t.stream=="function"&&(t[Symbol.toStringTag]==="Blob"||t[Symbol.toStringTag]==="File")}he.exports={isBlob:Es,isValidStatusCode:ws,isValidUTF8:Ne,tokenChars:Ss};if(ft)he.exports.isValidUTF8=function(t){return t.length<24?Ne(t):ft(t)};else if(!process.env.WS_NO_UTF_8_VALIDATE)try{let t=require("utf-8-validate");he.exports.isValidUTF8=function(e){return e.length<32?Ne(e):t(e)}}catch{}});var Re=v((jr,yt)=>{"use strict";var{Writable:ks}=require("stream"),dt=ee(),{BINARY_TYPES:Cs,EMPTY_BUFFER:ut,kStatusCode:Os,kWebSocket:Ts}=T(),{concat:Be,toArrayBuffer:Ls,unmask:Ns}=J(),{isValidStatusCode:Bs,isValidUTF8:pt}=G(),fe=Buffer[Symbol.species],S=0,_t=1,mt=2,gt=3,Pe=4,Ie=5,de=6,Ue=class extends ks{constructor(e={}){super(),this._allowSynchronousEvents=e.allowSynchronousEvents!==void 0?e.allowSynchronousEvents:!0,this._binaryType=e.binaryType||Cs[0],this._extensions=e.extensions||{},this._isServer=!!e.isServer,this._maxPayload=e.maxPayload|0,this._skipUTF8Validation=!!e.skipUTF8Validation,this[Ts]=void 0,this._bufferedBytes=0,this._buffers=[],this._compressed=!1,this._payloadLength=0,this._mask=void 0,this._fragmented=0,this._masked=!1,this._fin=!1,this._opcode=0,this._totalPayloadLength=0,this._messageLength=0,this._fragments=[],this._errored=!1,this._loop=!1,this._state=S}_write(e,s,i){if(this._opcode===8&&this._state==S)return i();this._bufferedBytes+=e.length,this._buffers.push(e),this.startLoop(i)}consume(e){if(this._bufferedBytes-=e,e===this._buffers[0].length)return this._buffers.shift();if(e<this._buffers[0].length){let i=this._buffers[0];return this._buffers[0]=new fe(i.buffer,i.byteOffset+e,i.length-e),new fe(i.buffer,i.byteOffset,e)}let s=Buffer.allocUnsafe(e);do{let i=this._buffers[0],r=s.length-e;e>=i.length?s.set(this._buffers.shift(),r):(s.set(new Uint8Array(i.buffer,i.byteOffset,e),r),this._buffers[0]=new fe(i.buffer,i.byteOffset+e,i.length-e)),e-=i.length}while(e>0);return s}startLoop(e){this._loop=!0;do switch(this._state){case S:this.getInfo(e);break;case _t:this.getPayloadLength16(e);break;case mt:this.getPayloadLength64(e);break;case gt:this.getMask();break;case Pe:this.getData(e);break;case Ie:case de:this._loop=!1;return}while(this._loop);this._errored||e()}getInfo(e){if(this._bufferedBytes<2){this._loop=!1;return}let s=this.consume(2);if((s[0]&48)!==0){let r=this.createError(RangeError,"RSV2 and RSV3 must be clear",!0,1002,"WS_ERR_UNEXPECTED_RSV_2_3");e(r);return}let i=(s[0]&64)===64;if(i&&!this._extensions[dt.extensionName]){let r=this.createError(RangeError,"RSV1 must be clear",!0,1002,"WS_ERR_UNEXPECTED_RSV_1");e(r);return}if(this._fin=(s[0]&128)===128,this._opcode=s[0]&15,this._payloadLength=s[1]&127,this._opcode===0){if(i){let r=this.createError(RangeError,"RSV1 must be clear",!0,1002,"WS_ERR_UNEXPECTED_RSV_1");e(r);return}if(!this._fragmented){let r=this.createError(RangeError,"invalid opcode 0",!0,1002,"WS_ERR_INVALID_OPCODE");e(r);return}this._opcode=this._fragmented}else if(this._opcode===1||this._opcode===2){if(this._fragmented){let r=this.createError(RangeError,`invalid opcode ${this._opcode}`,!0,1002,"WS_ERR_INVALID_OPCODE");e(r);return}this._compressed=i}else if(this._opcode>7&&this._opcode<11){if(!this._fin){let r=this.createError(RangeError,"FIN must be set",!0,1002,"WS_ERR_EXPECTED_FIN");e(r);return}if(i){let r=this.createError(RangeError,"RSV1 must be clear",!0,1002,"WS_ERR_UNEXPECTED_RSV_1");e(r);return}if(this._payloadLength>125||this._opcode===8&&this._payloadLength===1){let r=this.createError(RangeError,`invalid payload length ${this._payloadLength}`,!0,1002,"WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH");e(r);return}}else{let r=this.createError(RangeError,`invalid opcode ${this._opcode}`,!0,1002,"WS_ERR_INVALID_OPCODE");e(r);return}if(!this._fin&&!this._fragmented&&(this._fragmented=this._opcode),this._masked=(s[1]&128)===128,this._isServer){if(!this._masked){let r=this.createError(RangeError,"MASK must be set",!0,1002,"WS_ERR_EXPECTED_MASK");e(r);return}}else if(this._masked){let r=this.createError(RangeError,"MASK must be clear",!0,1002,"WS_ERR_UNEXPECTED_MASK");e(r);return}this._payloadLength===126?this._state=_t:this._payloadLength===127?this._state=mt:this.haveLength(e)}getPayloadLength16(e){if(this._bufferedBytes<2){this._loop=!1;return}this._payloadLength=this.consume(2).readUInt16BE(0),this.haveLength(e)}getPayloadLength64(e){if(this._bufferedBytes<8){this._loop=!1;return}let s=this.consume(8),i=s.readUInt32BE(0);if(i>Math.pow(2,21)-1){let r=this.createError(RangeError,"Unsupported WebSocket frame: payload length > 2^53 - 1",!1,1009,"WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH");e(r);return}this._payloadLength=i*Math.pow(2,32)+s.readUInt32BE(4),this.haveLength(e)}haveLength(e){if(this._payloadLength&&this._opcode<8&&(this._totalPayloadLength+=this._payloadLength,this._totalPayloadLength>this._maxPayload&&this._maxPayload>0)){let s=this.createError(RangeError,"Max payload size exceeded",!1,1009,"WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");e(s);return}this._masked?this._state=gt:this._state=Pe}getMask(){if(this._bufferedBytes<4){this._loop=!1;return}this._mask=this.consume(4),this._state=Pe}getData(e){let s=ut;if(this._payloadLength){if(this._bufferedBytes<this._payloadLength){this._loop=!1;return}s=this.consume(this._payloadLength),this._masked&&(this._mask[0]|this._mask[1]|this._mask[2]|this._mask[3])!==0&&Ns(s,this._mask)}if(this._opcode>7){this.controlMessage(s,e);return}if(this._compressed){this._state=Ie,this.decompress(s,e);return}s.length&&(this._messageLength=this._totalPayloadLength,this._fragments.push(s)),this.dataMessage(e)}decompress(e,s){this._extensions[dt.extensionName].decompress(e,this._fin,(r,n)=>{if(r)return s(r);if(n.length){if(this._messageLength+=n.length,this._messageLength>this._maxPayload&&this._maxPayload>0){let o=this.createError(RangeError,"Max payload size exceeded",!1,1009,"WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");s(o);return}this._fragments.push(n)}this.dataMessage(s),this._state===S&&this.startLoop(s)})}dataMessage(e){if(!this._fin){this._state=S;return}let s=this._messageLength,i=this._fragments;if(this._totalPayloadLength=0,this._messageLength=0,this._fragmented=0,this._fragments=[],this._opcode===2){let r;this._binaryType==="nodebuffer"?r=Be(i,s):this._binaryType==="arraybuffer"?r=Ls(Be(i,s)):this._binaryType==="blob"?r=new Blob(i):r=i,this._allowSynchronousEvents?(this.emit("message",r,!0),this._state=S):(this._state=de,setImmediate(()=>{this.emit("message",r,!0),this._state=S,this.startLoop(e)}))}else{let r=Be(i,s);if(!this._skipUTF8Validation&&!pt(r)){let n=this.createError(Error,"invalid UTF-8 sequence",!0,1007,"WS_ERR_INVALID_UTF8");e(n);return}this._state===Ie||this._allowSynchronousEvents?(this.emit("message",r,!1),this._state=S):(this._state=de,setImmediate(()=>{this.emit("message",r,!1),this._state=S,this.startLoop(e)}))}}controlMessage(e,s){if(this._opcode===8){if(e.length===0)this._loop=!1,this.emit("conclude",1005,ut),this.end();else{let i=e.readUInt16BE(0);if(!Bs(i)){let n=this.createError(RangeError,`invalid status code ${i}`,!0,1002,"WS_ERR_INVALID_CLOSE_CODE");s(n);return}let r=new fe(e.buffer,e.byteOffset+2,e.length-2);if(!this._skipUTF8Validation&&!pt(r)){let n=this.createError(Error,"invalid UTF-8 sequence",!0,1007,"WS_ERR_INVALID_UTF8");s(n);return}this._loop=!1,this.emit("conclude",i,r),this.end()}this._state=S;return}this._allowSynchronousEvents?(this.emit(this._opcode===9?"ping":"pong",e),this._state=S):(this._state=de,setImmediate(()=>{this.emit(this._opcode===9?"ping":"pong",e),this._state=S,this.startLoop(s)}))}createError(e,s,i,r,n){this._loop=!1,this._errored=!0;let o=new e(i?`Invalid WebSocket frame: ${s}`:s);return Error.captureStackTrace(o,this.createError),o.code=n,o[Os]=r,o}};yt.exports=Ue});var We=v((zr,bt)=>{"use strict";var{Duplex:Gr}=require("stream"),{randomFillSync:Ps}=require("crypto"),xt=ee(),{EMPTY_BUFFER:Is,kWebSocket:Us,NOOP:Rs}=T(),{isBlob:z,isValidStatusCode:Ds}=G(),{mask:vt,toBuffer:R}=J(),w=Symbol("kByteLength"),Ms=Buffer.alloc(4),ue=8*1024,D,H=ue,k=0,Ws=1,As=2,De=class t{constructor(e,s,i){this._extensions=s||{},i&&(this._generateMask=i,this._maskBuffer=Buffer.alloc(4)),this._socket=e,this._firstFragment=!0,this._compress=!1,this._bufferedBytes=0,this._queue=[],this._state=k,this.onerror=Rs,this[Us]=void 0}static frame(e,s){let i,r=!1,n=2,o=!1;s.mask&&(i=s.maskBuffer||Ms,s.generateMask?s.generateMask(i):(H===ue&&(D===void 0&&(D=Buffer.alloc(ue)),Ps(D,0,ue),H=0),i[0]=D[H++],i[1]=D[H++],i[2]=D[H++],i[3]=D[H++]),o=(i[0]|i[1]|i[2]|i[3])===0,n=6);let l;typeof e=="string"?(!s.mask||o)&&s[w]!==void 0?l=s[w]:(e=Buffer.from(e),l=e.length):(l=e.length,r=s.mask&&s.readOnly&&!o);let c=l;l>=65536?(n+=8,c=127):l>125&&(n+=2,c=126);let a=Buffer.allocUnsafe(r?l+n:n);return a[0]=s.fin?s.opcode|128:s.opcode,s.rsv1&&(a[0]|=64),a[1]=c,c===126?a.writeUInt16BE(l,2):c===127&&(a[2]=a[3]=0,a.writeUIntBE(l,4,6)),s.mask?(a[1]|=128,a[n-4]=i[0],a[n-3]=i[1],a[n-2]=i[2],a[n-1]=i[3],o?[a,e]:r?(vt(e,i,a,n,l),[a]):(vt(e,i,e,0,l),[a,e])):[a,e]}close(e,s,i,r){let n;if(e===void 0)n=Is;else{if(typeof e!="number"||!Ds(e))throw new TypeError("First argument must be a valid error code number");if(s===void 0||!s.length)n=Buffer.allocUnsafe(2),n.writeUInt16BE(e,0);else{let l=Buffer.byteLength(s);if(l>123)throw new RangeError("The message must not be greater than 123 bytes");n=Buffer.allocUnsafe(2+l),n.writeUInt16BE(e,0),typeof s=="string"?n.write(s,2):n.set(s,2)}}let o={[w]:n.length,fin:!0,generateMask:this._generateMask,mask:i,maskBuffer:this._maskBuffer,opcode:8,readOnly:!1,rsv1:!1};this._state!==k?this.enqueue([this.dispatch,n,!1,o,r]):this.sendFrame(t.frame(n,o),r)}ping(e,s,i){let r,n;if(typeof e=="string"?(r=Buffer.byteLength(e),n=!1):z(e)?(r=e.size,n=!1):(e=R(e),r=e.length,n=R.readOnly),r>125)throw new RangeError("The data size must not be greater than 125 bytes");let o={[w]:r,fin:!0,generateMask:this._generateMask,mask:s,maskBuffer:this._maskBuffer,opcode:9,readOnly:n,rsv1:!1};z(e)?this._state!==k?this.enqueue([this.getBlobData,e,!1,o,i]):this.getBlobData(e,!1,o,i):this._state!==k?this.enqueue([this.dispatch,e,!1,o,i]):this.sendFrame(t.frame(e,o),i)}pong(e,s,i){let r,n;if(typeof e=="string"?(r=Buffer.byteLength(e),n=!1):z(e)?(r=e.size,n=!1):(e=R(e),r=e.length,n=R.readOnly),r>125)throw new RangeError("The data size must not be greater than 125 bytes");let o={[w]:r,fin:!0,generateMask:this._generateMask,mask:s,maskBuffer:this._maskBuffer,opcode:10,readOnly:n,rsv1:!1};z(e)?this._state!==k?this.enqueue([this.getBlobData,e,!1,o,i]):this.getBlobData(e,!1,o,i):this._state!==k?this.enqueue([this.dispatch,e,!1,o,i]):this.sendFrame(t.frame(e,o),i)}send(e,s,i){let r=this._extensions[xt.extensionName],n=s.binary?2:1,o=s.compress,l,c;typeof e=="string"?(l=Buffer.byteLength(e),c=!1):z(e)?(l=e.size,c=!1):(e=R(e),l=e.length,c=R.readOnly),this._firstFragment?(this._firstFragment=!1,o&&r&&r.params[r._isServer?"server_no_context_takeover":"client_no_context_takeover"]&&(o=l>=r._threshold),this._compress=o):(o=!1,n=0),s.fin&&(this._firstFragment=!0);let a={[w]:l,fin:s.fin,generateMask:this._generateMask,mask:s.mask,maskBuffer:this._maskBuffer,opcode:n,readOnly:c,rsv1:o};z(e)?this._state!==k?this.enqueue([this.getBlobData,e,this._compress,a,i]):this.getBlobData(e,this._compress,a,i):this._state!==k?this.enqueue([this.dispatch,e,this._compress,a,i]):this.dispatch(e,this._compress,a,i)}getBlobData(e,s,i,r){this._bufferedBytes+=i[w],this._state=As,e.arrayBuffer().then(n=>{if(this._socket.destroyed){let l=new Error("The socket was closed while the blob was being read");process.nextTick(Me,this,l,r);return}this._bufferedBytes-=i[w];let o=R(n);s?this.dispatch(o,s,i,r):(this._state=k,this.sendFrame(t.frame(o,i),r),this.dequeue())}).catch(n=>{process.nextTick(Fs,this,n,r)})}dispatch(e,s,i,r){if(!s){this.sendFrame(t.frame(e,i),r);return}let n=this._extensions[xt.extensionName];this._bufferedBytes+=i[w],this._state=Ws,n.compress(e,i.fin,(o,l)=>{if(this._socket.destroyed){let c=new Error("The socket was closed while data was being compressed");Me(this,c,r);return}this._bufferedBytes-=i[w],this._state=k,i.readOnly=!1,this.sendFrame(t.frame(l,i),r),this.dequeue()})}dequeue(){for(;this._state===k&&this._queue.length;){let e=this._queue.shift();this._bufferedBytes-=e[3][w],Reflect.apply(e[0],this,e.slice(1))}}enqueue(e){this._bufferedBytes+=e[3][w],this._queue.push(e)}sendFrame(e,s){e.length===2?(this._socket.cork(),this._socket.write(e[0]),this._socket.write(e[1],s),this._socket.uncork()):this._socket.write(e[0],s)}};bt.exports=De;function Me(t,e,s){typeof s=="function"&&s(e);for(let i=0;i<t._queue.length;i++){let r=t._queue[i],n=r[r.length-1];typeof n=="function"&&n(e)}}function Fs(t,e,s){Me(t,e,s),t.onerror(e)}});var Nt=v((Hr,Lt)=>{"use strict";var{kForOnEventAttribute:te,kListener:Ae}=T(),St=Symbol("kCode"),wt=Symbol("kData"),Et=Symbol("kError"),kt=Symbol("kMessage"),Ct=Symbol("kReason"),Y=Symbol("kTarget"),Ot=Symbol("kType"),Tt=Symbol("kWasClean"),N=class{constructor(e){this[Y]=null,this[Ot]=e}get target(){return this[Y]}get type(){return this[Ot]}};Object.defineProperty(N.prototype,"target",{enumerable:!0});Object.defineProperty(N.prototype,"type",{enumerable:!0});var M=class extends N{constructor(e,s={}){super(e),this[St]=s.code===void 0?0:s.code,this[Ct]=s.reason===void 0?"":s.reason,this[Tt]=s.wasClean===void 0?!1:s.wasClean}get code(){return this[St]}get reason(){return this[Ct]}get wasClean(){return this[Tt]}};Object.defineProperty(M.prototype,"code",{enumerable:!0});Object.defineProperty(M.prototype,"reason",{enumerable:!0});Object.defineProperty(M.prototype,"wasClean",{enumerable:!0});var K=class extends N{constructor(e,s={}){super(e),this[Et]=s.error===void 0?null:s.error,this[kt]=s.message===void 0?"":s.message}get error(){return this[Et]}get message(){return this[kt]}};Object.defineProperty(K.prototype,"error",{enumerable:!0});Object.defineProperty(K.prototype,"message",{enumerable:!0});var se=class extends N{constructor(e,s={}){super(e),this[wt]=s.data===void 0?null:s.data}get data(){return this[wt]}};Object.defineProperty(se.prototype,"data",{enumerable:!0});var $s={addEventListener(t,e,s={}){for(let r of this.listeners(t))if(!s[te]&&r[Ae]===e&&!r[te])return;let i;if(t==="message")i=function(n,o){let l=new se("message",{data:o?n:n.toString()});l[Y]=this,pe(e,this,l)};else if(t==="close")i=function(n,o){let l=new M("close",{code:n,reason:o.toString(),wasClean:this._closeFrameReceived&&this._closeFrameSent});l[Y]=this,pe(e,this,l)};else if(t==="error")i=function(n){let o=new K("error",{error:n,message:n.message});o[Y]=this,pe(e,this,o)};else if(t==="open")i=function(){let n=new N("open");n[Y]=this,pe(e,this,n)};else return;i[te]=!!s[te],i[Ae]=e,s.once?this.once(t,i):this.on(t,i)},removeEventListener(t,e){for(let s of this.listeners(t))if(s[Ae]===e&&!s[te]){this.removeListener(t,s);break}}};Lt.exports={CloseEvent:M,ErrorEvent:K,Event:N,EventTarget:$s,MessageEvent:se};function pe(t,e,s){typeof t=="object"&&t.handleEvent?t.handleEvent.call(t,s):t.call(e,s)}});var Fe=v((Yr,Bt)=>{"use strict";var{tokenChars:re}=G();function C(t,e,s){t[e]===void 0?t[e]=[s]:t[e].push(s)}function Vs(t){let e=Object.create(null),s=Object.create(null),i=!1,r=!1,n=!1,o,l,c=-1,a=-1,h=-1,f=0;for(;f<t.length;f++)if(a=t.charCodeAt(f),o===void 0)if(h===-1&&re[a]===1)c===-1&&(c=f);else if(f!==0&&(a===32||a===9))h===-1&&c!==-1&&(h=f);else if(a===59||a===44){if(c===-1)throw new SyntaxError(`Unexpected character at index ${f}`);h===-1&&(h=f);let m=t.slice(c,h);a===44?(C(e,m,s),s=Object.create(null)):o=m,c=h=-1}else throw new SyntaxError(`Unexpected character at index ${f}`);else if(l===void 0)if(h===-1&&re[a]===1)c===-1&&(c=f);else if(a===32||a===9)h===-1&&c!==-1&&(h=f);else if(a===59||a===44){if(c===-1)throw new SyntaxError(`Unexpected character at index ${f}`);h===-1&&(h=f),C(s,t.slice(c,h),!0),a===44&&(C(e,o,s),s=Object.create(null),o=void 0),c=h=-1}else if(a===61&&c!==-1&&h===-1)l=t.slice(c,f),c=h=-1;else throw new SyntaxError(`Unexpected character at index ${f}`);else if(r){if(re[a]!==1)throw new SyntaxError(`Unexpected character at index ${f}`);c===-1?c=f:i||(i=!0),r=!1}else if(n)if(re[a]===1)c===-1&&(c=f);else if(a===34&&c!==-1)n=!1,h=f;else if(a===92)r=!0;else throw new SyntaxError(`Unexpected character at index ${f}`);else if(a===34&&t.charCodeAt(f-1)===61)n=!0;else if(h===-1&&re[a]===1)c===-1&&(c=f);else if(c!==-1&&(a===32||a===9))h===-1&&(h=f);else if(a===59||a===44){if(c===-1)throw new SyntaxError(`Unexpected character at index ${f}`);h===-1&&(h=f);let m=t.slice(c,h);i&&(m=m.replace(/\\/g,""),i=!1),C(s,l,m),a===44&&(C(e,o,s),s=Object.create(null),o=void 0),l=void 0,c=h=-1}else throw new SyntaxError(`Unexpected character at index ${f}`);if(c===-1||n||a===32||a===9)throw new SyntaxError("Unexpected end of input");h===-1&&(h=f);let p=t.slice(c,h);return o===void 0?C(e,p,s):(l===void 0?C(s,p,!0):i?C(s,l,p.replace(/\\/g,"")):C(s,l,p),C(e,o,s)),e}function qs(t){return Object.keys(t).map(e=>{let s=t[e];return Array.isArray(s)||(s=[s]),s.map(i=>[e].concat(Object.keys(i).map(r=>{let n=i[r];return Array.isArray(n)||(n=[n]),n.map(o=>o===!0?r:`${r}=${o}`).join("; ")})).join("; ")).join(", ")}).join(", ")}Bt.exports={format:qs,parse:Vs}});var ye=v((Zr,qt)=>{"use strict";var js=require("events"),Gs=require("https"),zs=require("http"),Ut=require("net"),Hs=require("tls"),{randomBytes:Ys,createHash:Ks}=require("crypto"),{Duplex:Kr,Readable:Xr}=require("stream"),{URL:$e}=require("url"),I=ee(),Xs=Re(),Zs=We(),{isBlob:Js}=G(),{BINARY_TYPES:Pt,EMPTY_BUFFER:_e,GUID:Qs,kForOnEventAttribute:Ve,kListener:er,kStatusCode:tr,kWebSocket:y,NOOP:Rt}=T(),{EventTarget:{addEventListener:sr,removeEventListener:rr}}=Nt(),{format:ir,parse:nr}=Fe(),{toBuffer:or}=J(),ar=30*1e3,Dt=Symbol("kAborted"),qe=[8,13],B=["CONNECTING","OPEN","CLOSING","CLOSED"],lr=/^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/,u=class t extends js{constructor(e,s,i){super(),this._binaryType=Pt[0],this._closeCode=1006,this._closeFrameReceived=!1,this._closeFrameSent=!1,this._closeMessage=_e,this._closeTimer=null,this._errorEmitted=!1,this._extensions={},this._paused=!1,this._protocol="",this._readyState=t.CONNECTING,this._receiver=null,this._sender=null,this._socket=null,e!==null?(this._bufferedAmount=0,this._isServer=!1,this._redirects=0,s===void 0?s=[]:Array.isArray(s)||(typeof s=="object"&&s!==null?(i=s,s=[]):s=[s]),Mt(this,e,s,i)):(this._autoPong=i.autoPong,this._isServer=!0)}get binaryType(){return this._binaryType}set binaryType(e){Pt.includes(e)&&(this._binaryType=e,this._receiver&&(this._receiver._binaryType=e))}get bufferedAmount(){return this._socket?this._socket._writableState.length+this._sender._bufferedBytes:this._bufferedAmount}get extensions(){return Object.keys(this._extensions).join()}get isPaused(){return this._paused}get onclose(){return null}get onerror(){return null}get onopen(){return null}get onmessage(){return null}get protocol(){return this._protocol}get readyState(){return this._readyState}get url(){return this._url}setSocket(e,s,i){let r=new Xs({allowSynchronousEvents:i.allowSynchronousEvents,binaryType:this.binaryType,extensions:this._extensions,isServer:this._isServer,maxPayload:i.maxPayload,skipUTF8Validation:i.skipUTF8Validation}),n=new Zs(e,this._extensions,i.generateMask);this._receiver=r,this._sender=n,this._socket=e,r[y]=this,n[y]=this,e[y]=this,r.on("conclude",fr),r.on("drain",dr),r.on("error",ur),r.on("message",pr),r.on("ping",_r),r.on("pong",mr),n.onerror=gr,e.setTimeout&&e.setTimeout(0),e.setNoDelay&&e.setNoDelay(),s.length>0&&e.unshift(s),e.on("close",Ft),e.on("data",ge),e.on("end",$t),e.on("error",Vt),this._readyState=t.OPEN,this.emit("open")}emitClose(){if(!this._socket){this._readyState=t.CLOSED,this.emit("close",this._closeCode,this._closeMessage);return}this._extensions[I.extensionName]&&this._extensions[I.extensionName].cleanup(),this._receiver.removeAllListeners(),this._readyState=t.CLOSED,this.emit("close",this._closeCode,this._closeMessage)}close(e,s){if(this.readyState!==t.CLOSED){if(this.readyState===t.CONNECTING){b(this,this._req,"WebSocket was closed before the connection was established");return}if(this.readyState===t.CLOSING){this._closeFrameSent&&(this._closeFrameReceived||this._receiver._writableState.errorEmitted)&&this._socket.end();return}this._readyState=t.CLOSING,this._sender.close(e,s,!this._isServer,i=>{i||(this._closeFrameSent=!0,(this._closeFrameReceived||this._receiver._writableState.errorEmitted)&&this._socket.end())}),At(this)}}pause(){this.readyState===t.CONNECTING||this.readyState===t.CLOSED||(this._paused=!0,this._socket.pause())}ping(e,s,i){if(this.readyState===t.CONNECTING)throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");if(typeof e=="function"?(i=e,e=s=void 0):typeof s=="function"&&(i=s,s=void 0),typeof e=="number"&&(e=e.toString()),this.readyState!==t.OPEN){je(this,e,i);return}s===void 0&&(s=!this._isServer),this._sender.ping(e||_e,s,i)}pong(e,s,i){if(this.readyState===t.CONNECTING)throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");if(typeof e=="function"?(i=e,e=s=void 0):typeof s=="function"&&(i=s,s=void 0),typeof e=="number"&&(e=e.toString()),this.readyState!==t.OPEN){je(this,e,i);return}s===void 0&&(s=!this._isServer),this._sender.pong(e||_e,s,i)}resume(){this.readyState===t.CONNECTING||this.readyState===t.CLOSED||(this._paused=!1,this._receiver._writableState.needDrain||this._socket.resume())}send(e,s,i){if(this.readyState===t.CONNECTING)throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");if(typeof s=="function"&&(i=s,s={}),typeof e=="number"&&(e=e.toString()),this.readyState!==t.OPEN){je(this,e,i);return}let r={binary:typeof e!="string",mask:!this._isServer,compress:!0,fin:!0,...s};this._extensions[I.extensionName]||(r.compress=!1),this._sender.send(e||_e,r,i)}terminate(){if(this.readyState!==t.CLOSED){if(this.readyState===t.CONNECTING){b(this,this._req,"WebSocket was closed before the connection was established");return}this._socket&&(this._readyState=t.CLOSING,this._socket.destroy())}}};Object.defineProperty(u,"CONNECTING",{enumerable:!0,value:B.indexOf("CONNECTING")});Object.defineProperty(u.prototype,"CONNECTING",{enumerable:!0,value:B.indexOf("CONNECTING")});Object.defineProperty(u,"OPEN",{enumerable:!0,value:B.indexOf("OPEN")});Object.defineProperty(u.prototype,"OPEN",{enumerable:!0,value:B.indexOf("OPEN")});Object.defineProperty(u,"CLOSING",{enumerable:!0,value:B.indexOf("CLOSING")});Object.defineProperty(u.prototype,"CLOSING",{enumerable:!0,value:B.indexOf("CLOSING")});Object.defineProperty(u,"CLOSED",{enumerable:!0,value:B.indexOf("CLOSED")});Object.defineProperty(u.prototype,"CLOSED",{enumerable:!0,value:B.indexOf("CLOSED")});["binaryType","bufferedAmount","extensions","isPaused","protocol","readyState","url"].forEach(t=>{Object.defineProperty(u.prototype,t,{enumerable:!0})});["open","error","close","message"].forEach(t=>{Object.defineProperty(u.prototype,`on${t}`,{enumerable:!0,get(){for(let e of this.listeners(t))if(e[Ve])return e[er];return null},set(e){for(let s of this.listeners(t))if(s[Ve]){this.removeListener(t,s);break}typeof e=="function"&&this.addEventListener(t,e,{[Ve]:!0})}})});u.prototype.addEventListener=sr;u.prototype.removeEventListener=rr;qt.exports=u;function Mt(t,e,s,i){let r={allowSynchronousEvents:!0,autoPong:!0,protocolVersion:qe[1],maxPayload:104857600,skipUTF8Validation:!1,perMessageDeflate:!0,followRedirects:!1,maxRedirects:10,...i,socketPath:void 0,hostname:void 0,protocol:void 0,timeout:void 0,method:"GET",host:void 0,path:void 0,port:void 0};if(t._autoPong=r.autoPong,!qe.includes(r.protocolVersion))throw new RangeError(`Unsupported protocol version: ${r.protocolVersion} (supported versions: ${qe.join(", ")})`);let n;if(e instanceof $e)n=e;else try{n=new $e(e)}catch{throw new SyntaxError(`Invalid URL: ${e}`)}n.protocol==="http:"?n.protocol="ws:":n.protocol==="https:"&&(n.protocol="wss:"),t._url=n.href;let o=n.protocol==="wss:",l=n.protocol==="ws+unix:",c;if(n.protocol!=="ws:"&&!o&&!l?c=`The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`:l&&!n.pathname?c="The URL's pathname is empty":n.hash&&(c="The URL contains a fragment identifier"),c){let d=new SyntaxError(c);if(t._redirects===0)throw d;me(t,d);return}let a=o?443:80,h=Ys(16).toString("base64"),f=o?Gs.request:zs.request,p=new Set,m;if(r.createConnection=r.createConnection||(o?hr:cr),r.defaultPort=r.defaultPort||a,r.port=n.port||a,r.host=n.hostname.startsWith("[")?n.hostname.slice(1,-1):n.hostname,r.headers={...r.headers,"Sec-WebSocket-Version":r.protocolVersion,"Sec-WebSocket-Key":h,Connection:"Upgrade",Upgrade:"websocket"},r.path=n.pathname+n.search,r.timeout=r.handshakeTimeout,r.perMessageDeflate&&(m=new I(r.perMessageDeflate!==!0?r.perMessageDeflate:{},!1,r.maxPayload),r.headers["Sec-WebSocket-Extensions"]=ir({[I.extensionName]:m.offer()})),s.length){for(let d of s){if(typeof d!="string"||!lr.test(d)||p.has(d))throw new SyntaxError("An invalid or duplicated subprotocol was specified");p.add(d)}r.headers["Sec-WebSocket-Protocol"]=s.join(",")}if(r.origin&&(r.protocolVersion<13?r.headers["Sec-WebSocket-Origin"]=r.origin:r.headers.Origin=r.origin),(n.username||n.password)&&(r.auth=`${n.username}:${n.password}`),l){let d=r.path.split(":");r.socketPath=d[0],r.path=d[1]}let _;if(r.followRedirects){if(t._redirects===0){t._originalIpc=l,t._originalSecure=o,t._originalHostOrSocketPath=l?r.socketPath:n.host;let d=i&&i.headers;if(i={...i,headers:{}},d)for(let[x,F]of Object.entries(d))i.headers[x.toLowerCase()]=F}else if(t.listenerCount("redirect")===0){let d=l?t._originalIpc?r.socketPath===t._originalHostOrSocketPath:!1:t._originalIpc?!1:n.host===t._originalHostOrSocketPath;(!d||t._originalSecure&&!o)&&(delete r.headers.authorization,delete r.headers.cookie,d||delete r.headers.host,r.auth=void 0)}r.auth&&!i.headers.authorization&&(i.headers.authorization="Basic "+Buffer.from(r.auth).toString("base64")),_=t._req=f(r),t._redirects&&t.emit("redirect",t.url,_)}else _=t._req=f(r);r.timeout&&_.on("timeout",()=>{b(t,_,"Opening handshake has timed out")}),_.on("error",d=>{_===null||_[Dt]||(_=t._req=null,me(t,d))}),_.on("response",d=>{let x=d.headers.location,F=d.statusCode;if(x&&r.followRedirects&&F>=300&&F<400){if(++t._redirects>r.maxRedirects){b(t,_,"Maximum redirects exceeded");return}_.abort();let X;try{X=new $e(x,e)}catch{let $=new SyntaxError(`Invalid URL: ${x}`);me(t,$);return}Mt(t,X,s,i)}else t.emit("unexpected-response",_,d)||b(t,_,`Unexpected server response: ${d.statusCode}`)}),_.on("upgrade",(d,x,F)=>{if(t.emit("upgrade",d),t.readyState!==u.CONNECTING)return;_=t._req=null;let X=d.headers.upgrade;if(X===void 0||X.toLowerCase()!=="websocket"){b(t,x,"Invalid Upgrade header");return}let Ke=Ks("sha1").update(h+Qs).digest("base64");if(d.headers["sec-websocket-accept"]!==Ke){b(t,x,"Invalid Sec-WebSocket-Accept header");return}let $=d.headers["sec-websocket-protocol"],Z;if($!==void 0?p.size?p.has($)||(Z="Server sent an invalid subprotocol"):Z="Server sent a subprotocol but none was requested":p.size&&(Z="Server sent no subprotocol"),Z){b(t,x,Z);return}$&&(t._protocol=$);let Xe=d.headers["sec-websocket-extensions"];if(Xe!==void 0){if(!m){b(t,x,"Server sent a Sec-WebSocket-Extensions header but no extension was requested");return}let we;try{we=nr(Xe)}catch{b(t,x,"Invalid Sec-WebSocket-Extensions header");return}let Ze=Object.keys(we);if(Ze.length!==1||Ze[0]!==I.extensionName){b(t,x,"Server indicated an extension that was not requested");return}try{m.accept(we[I.extensionName])}catch{b(t,x,"Invalid Sec-WebSocket-Extensions header");return}t._extensions[I.extensionName]=m}t.setSocket(x,F,{allowSynchronousEvents:r.allowSynchronousEvents,generateMask:r.generateMask,maxPayload:r.maxPayload,skipUTF8Validation:r.skipUTF8Validation})}),r.finishRequest?r.finishRequest(_,t):_.end()}function me(t,e){t._readyState=u.CLOSING,t._errorEmitted=!0,t.emit("error",e),t.emitClose()}function cr(t){return t.path=t.socketPath,Ut.connect(t)}function hr(t){return t.path=void 0,!t.servername&&t.servername!==""&&(t.servername=Ut.isIP(t.host)?"":t.host),Hs.connect(t)}function b(t,e,s){t._readyState=u.CLOSING;let i=new Error(s);Error.captureStackTrace(i,b),e.setHeader?(e[Dt]=!0,e.abort(),e.socket&&!e.socket.destroyed&&e.socket.destroy(),process.nextTick(me,t,i)):(e.destroy(i),e.once("error",t.emit.bind(t,"error")),e.once("close",t.emitClose.bind(t)))}function je(t,e,s){if(e){let i=Js(e)?e.size:or(e).length;t._socket?t._sender._bufferedBytes+=i:t._bufferedAmount+=i}if(s){let i=new Error(`WebSocket is not open: readyState ${t.readyState} (${B[t.readyState]})`);process.nextTick(s,i)}}function fr(t,e){let s=this[y];s._closeFrameReceived=!0,s._closeMessage=e,s._closeCode=t,s._socket[y]!==void 0&&(s._socket.removeListener("data",ge),process.nextTick(Wt,s._socket),t===1005?s.close():s.close(t,e))}function dr(){let t=this[y];t.isPaused||t._socket.resume()}function ur(t){let e=this[y];e._socket[y]!==void 0&&(e._socket.removeListener("data",ge),process.nextTick(Wt,e._socket),e.close(t[tr])),e._errorEmitted||(e._errorEmitted=!0,e.emit("error",t))}function It(){this[y].emitClose()}function pr(t,e){this[y].emit("message",t,e)}function _r(t){let e=this[y];e._autoPong&&e.pong(t,!this._isServer,Rt),e.emit("ping",t)}function mr(t){this[y].emit("pong",t)}function Wt(t){t.resume()}function gr(t){let e=this[y];e.readyState!==u.CLOSED&&(e.readyState===u.OPEN&&(e._readyState=u.CLOSING,At(e)),this._socket.end(),e._errorEmitted||(e._errorEmitted=!0,e.emit("error",t)))}function At(t){t._closeTimer=setTimeout(t._socket.destroy.bind(t._socket),ar)}function Ft(){let t=this[y];this.removeListener("close",Ft),this.removeListener("data",ge),this.removeListener("end",$t),t._readyState=u.CLOSING;let e;!this._readableState.endEmitted&&!t._closeFrameReceived&&!t._receiver._writableState.errorEmitted&&(e=t._socket.read())!==null&&t._receiver.write(e),t._receiver.end(),this[y]=void 0,clearTimeout(t._closeTimer),t._receiver._writableState.finished||t._receiver._writableState.errorEmitted?t.emitClose():(t._receiver.on("error",It),t._receiver.on("finish",It))}function ge(t){this[y]._receiver.write(t)||this.pause()}function $t(){let t=this[y];t._readyState=u.CLOSING,t._receiver.end(),this.end()}function Vt(){let t=this[y];this.removeListener("error",Vt),this.on("error",Rt),t&&(t._readyState=u.CLOSING,this.destroy())}});var Ht=v((Qr,zt)=>{"use strict";var Jr=ye(),{Duplex:yr}=require("stream");function jt(t){t.emit("close")}function xr(){!this.destroyed&&this._writableState.finished&&this.destroy()}function Gt(t){this.removeListener("error",Gt),this.destroy(),this.listenerCount("error")===0&&this.emit("error",t)}function vr(t,e){let s=!0,i=new yr({...e,autoDestroy:!1,emitClose:!1,objectMode:!1,writableObjectMode:!1});return t.on("message",function(n,o){let l=!o&&i._readableState.objectMode?n.toString():n;i.push(l)||t.pause()}),t.once("error",function(n){i.destroyed||(s=!1,i.destroy(n))}),t.once("close",function(){i.destroyed||i.push(null)}),i._destroy=function(r,n){if(t.readyState===t.CLOSED){n(r),process.nextTick(jt,i);return}let o=!1;t.once("error",function(c){o=!0,n(c)}),t.once("close",function(){o||n(r),process.nextTick(jt,i)}),s&&t.terminate()},i._final=function(r){if(t.readyState===t.CONNECTING){t.once("open",function(){i._final(r)});return}t._socket!==null&&(t._socket._writableState.finished?(r(),i._readableState.endEmitted&&i.destroy()):(t._socket.once("finish",function(){r()}),t.close()))},i._read=function(){t.isPaused&&t.resume()},i._write=function(r,n,o){if(t.readyState===t.CONNECTING){t.once("open",function(){i._write(r,n,o)});return}t.send(r,o)},i.on("end",xr),i.on("error",Gt),i}zt.exports=vr});var Kt=v((ei,Yt)=>{"use strict";var{tokenChars:br}=G();function Sr(t){let e=new Set,s=-1,i=-1,r=0;for(r;r<t.length;r++){let o=t.charCodeAt(r);if(i===-1&&br[o]===1)s===-1&&(s=r);else if(r!==0&&(o===32||o===9))i===-1&&s!==-1&&(i=r);else if(o===44){if(s===-1)throw new SyntaxError(`Unexpected character at index ${r}`);i===-1&&(i=r);let l=t.slice(s,i);if(e.has(l))throw new SyntaxError(`The "${l}" subprotocol is duplicated`);e.add(l),s=i=-1}else throw new SyntaxError(`Unexpected character at index ${r}`)}if(s===-1||i!==-1)throw new SyntaxError("Unexpected end of input");let n=t.slice(s,r);if(e.has(n))throw new SyntaxError(`The "${n}" subprotocol is duplicated`);return e.add(n),e}Yt.exports={parse:Sr}});var ss=v((si,ts)=>{"use strict";var wr=require("events"),xe=require("http"),{Duplex:ti}=require("stream"),{createHash:Er}=require("crypto"),Xt=Fe(),W=ee(),kr=Kt(),Cr=ye(),{GUID:Or,kWebSocket:Tr}=T(),Lr=/^[+/0-9A-Za-z]{22}==$/,Zt=0,Jt=1,es=2,Ge=class extends wr{constructor(e,s){if(super(),e={allowSynchronousEvents:!0,autoPong:!0,maxPayload:100*1024*1024,skipUTF8Validation:!1,perMessageDeflate:!1,handleProtocols:null,clientTracking:!0,verifyClient:null,noServer:!1,backlog:null,server:null,host:null,path:null,port:null,WebSocket:Cr,...e},e.port==null&&!e.server&&!e.noServer||e.port!=null&&(e.server||e.noServer)||e.server&&e.noServer)throw new TypeError('One and only one of the "port", "server", or "noServer" options must be specified');if(e.port!=null?(this._server=xe.createServer((i,r)=>{let n=xe.STATUS_CODES[426];r.writeHead(426,{"Content-Length":n.length,"Content-Type":"text/plain"}),r.end(n)}),this._server.listen(e.port,e.host,e.backlog,s)):e.server&&(this._server=e.server),this._server){let i=this.emit.bind(this,"connection");this._removeListeners=Nr(this._server,{listening:this.emit.bind(this,"listening"),error:this.emit.bind(this,"error"),upgrade:(r,n,o)=>{this.handleUpgrade(r,n,o,i)}})}e.perMessageDeflate===!0&&(e.perMessageDeflate={}),e.clientTracking&&(this.clients=new Set,this._shouldEmitClose=!1),this.options=e,this._state=Zt}address(){if(this.options.noServer)throw new Error('The server is operating in "noServer" mode');return this._server?this._server.address():null}close(e){if(this._state===es){e&&this.once("close",()=>{e(new Error("The server is not running"))}),process.nextTick(ie,this);return}if(e&&this.once("close",e),this._state!==Jt)if(this._state=Jt,this.options.noServer||this.options.server)this._server&&(this._removeListeners(),this._removeListeners=this._server=null),this.clients?this.clients.size?this._shouldEmitClose=!0:process.nextTick(ie,this):process.nextTick(ie,this);else{let s=this._server;this._removeListeners(),this._removeListeners=this._server=null,s.close(()=>{ie(this)})}}shouldHandle(e){if(this.options.path){let s=e.url.indexOf("?");if((s!==-1?e.url.slice(0,s):e.url)!==this.options.path)return!1}return!0}handleUpgrade(e,s,i,r){s.on("error",Qt);let n=e.headers["sec-websocket-key"],o=e.headers.upgrade,l=+e.headers["sec-websocket-version"];if(e.method!=="GET"){A(this,e,s,405,"Invalid HTTP method");return}if(o===void 0||o.toLowerCase()!=="websocket"){A(this,e,s,400,"Invalid Upgrade header");return}if(n===void 0||!Lr.test(n)){A(this,e,s,400,"Missing or invalid Sec-WebSocket-Key header");return}if(l!==13&&l!==8){A(this,e,s,400,"Missing or invalid Sec-WebSocket-Version header",{"Sec-WebSocket-Version":"13, 8"});return}if(!this.shouldHandle(e)){ne(s,400);return}let c=e.headers["sec-websocket-protocol"],a=new Set;if(c!==void 0)try{a=kr.parse(c)}catch{A(this,e,s,400,"Invalid Sec-WebSocket-Protocol header");return}let h=e.headers["sec-websocket-extensions"],f={};if(this.options.perMessageDeflate&&h!==void 0){let p=new W(this.options.perMessageDeflate,!0,this.options.maxPayload);try{let m=Xt.parse(h);m[W.extensionName]&&(p.accept(m[W.extensionName]),f[W.extensionName]=p)}catch{A(this,e,s,400,"Invalid or unacceptable Sec-WebSocket-Extensions header");return}}if(this.options.verifyClient){let p={origin:e.headers[`${l===8?"sec-websocket-origin":"origin"}`],secure:!!(e.socket.authorized||e.socket.encrypted),req:e};if(this.options.verifyClient.length===2){this.options.verifyClient(p,(m,_,d,x)=>{if(!m)return ne(s,_||401,d,x);this.completeUpgrade(f,n,a,e,s,i,r)});return}if(!this.options.verifyClient(p))return ne(s,401)}this.completeUpgrade(f,n,a,e,s,i,r)}completeUpgrade(e,s,i,r,n,o,l){if(!n.readable||!n.writable)return n.destroy();if(n[Tr])throw new Error("server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration");if(this._state>Zt)return ne(n,503);let a=["HTTP/1.1 101 Switching Protocols","Upgrade: websocket","Connection: Upgrade",`Sec-WebSocket-Accept: ${Er("sha1").update(s+Or).digest("base64")}`],h=new this.options.WebSocket(null,void 0,this.options);if(i.size){let f=this.options.handleProtocols?this.options.handleProtocols(i,r):i.values().next().value;f&&(a.push(`Sec-WebSocket-Protocol: ${f}`),h._protocol=f)}if(e[W.extensionName]){let f=e[W.extensionName].params,p=Xt.format({[W.extensionName]:[f]});a.push(`Sec-WebSocket-Extensions: ${p}`),h._extensions=e}this.emit("headers",a,r),n.write(a.concat(`\r
`).join(`\r
`)),n.removeListener("error",Qt),h.setSocket(n,o,{allowSynchronousEvents:this.options.allowSynchronousEvents,maxPayload:this.options.maxPayload,skipUTF8Validation:this.options.skipUTF8Validation}),this.clients&&(this.clients.add(h),h.on("close",()=>{this.clients.delete(h),this._shouldEmitClose&&!this.clients.size&&process.nextTick(ie,this)})),l(h,r)}};ts.exports=Ge;function Nr(t,e){for(let s of Object.keys(e))t.on(s,e[s]);return function(){for(let i of Object.keys(e))t.removeListener(i,e[i])}}function ie(t){t._state=es,t.emit("close")}function Qt(){this.destroy()}function ne(t,e,s,i){s=s||xe.STATUS_CODES[e],i={Connection:"close","Content-Type":"text/html","Content-Length":Buffer.byteLength(s),...i},t.once("finish",t.destroy),t.end(`HTTP/1.1 ${e} ${xe.STATUS_CODES[e]}\r
`+Object.keys(i).map(r=>`${r}: ${i[r]}`).join(`\r
`)+`\r
\r
`+s)}function A(t,e,s,i,r,n){if(t.listenerCount("wsClientError")){let o=new Error(r);Error.captureStackTrace(o,A),t.emit("wsClientError",o,s,e)}else ne(s,i,r,n)}});var Mr={};fs(Mr,{activate:()=>Rr,deactivate:()=>Dr});module.exports=ds(Mr);var g=V(require("vscode"));var Br=V(Ht(),1),Pr=V(Re(),1),Ir=V(We(),1),rs=V(ye(),1),Ur=V(ss(),1);var is=rs.default;var be="secreteChat.serverUrl",E,O=null,ze=!1,ve=!1,He;function U(t){let e=new Date().toLocaleTimeString();He.appendLine(`[${e}] ${t}`)}function Rr(t){He=g.window.createOutputChannel("Secrete Chat"),t.subscriptions.push(He),U("Extension activated"),E=g.window.createStatusBarItem(g.StatusBarAlignment.Right,100),E.text="\u25CB",E.tooltip="Secrete Chat",E.command="secreteChat.openChat",E.show(),t.subscriptions.push(E);let e=new Se(t.extensionUri,t,()=>{ze=!1,E.text="\u25CB",E.color=void 0},i=>{Ye(i,e)});t.subscriptions.push(g.window.registerWebviewViewProvider(Se.viewType,e,{webviewOptions:{retainContextWhenHidden:!0}})),t.subscriptions.push(g.commands.registerCommand("secreteChat.openChat",()=>{ze=!1,E.text="\u25CB",E.color=void 0,g.commands.executeCommand("workbench.view.extension.secrete-chat")}));let s=t.globalState.get(be);s&&Ye(s,e)}function Ye(t,e){try{O&&(ve=!0,O.removeAllListeners(),O.close(),O=null);let i=`ws://${new URL(t).hostname}:9999`;U(`Connecting to: ${i}`),O=new is(i),ve=!1,O.on("open",()=>{U("WebSocket connected!");let r={type:"join",nickname:"__monitor__"+Math.random().toString(36).substring(7)};O?.send(JSON.stringify(r))}),O.on("message",r=>{try{let n=JSON.parse(r.toString());U(`Received: ${n.type}, isVisible: ${e.isVisible()}`),(n.type==="message"||n.type==="whisper")&&(e.isVisible()||(ze=!0,E.text="\u25CF",E.color=new g.ThemeColor("charts.red"),U("New message! Status bar \u2192 red")))}catch{}}),O.on("error",r=>{U(`Error: ${r.message}`)}),O.on("close",()=>{U(`Closed, intentional: ${ve}`),ve||setTimeout(()=>Ye(t,e),5e3)})}catch(s){U(`Exception: ${s}`)}}var Se=class{constructor(e,s,i,r){this._extensionUri=e;this._context=s;this._onViewed=i;this._onUrlSaved=r}static viewType="secreteChat.chatView";_view;_isVisible=!1;isVisible(){return this._isVisible&&this._view?.visible===!0}resolveWebviewView(e,s,i){this._view=e,e.webview.options={enableScripts:!0,localResourceRoots:[this._extensionUri]},this._updateWebview(),e.webview.onDidReceiveMessage(async r=>{r.type==="openExternal"&&r.url?g.env.openExternal(g.Uri.parse(r.url)):r.type==="openSimpleBrowser"&&r.url?g.commands.executeCommand("simpleBrowser.show",r.url):r.type==="openImage"&&r.url?this._openImagePanel(r.url):r.type==="saveUrl"&&r.url?(await this._context.globalState.update(be,r.url),this._onUrlSaved?.(r.url),this._updateWebview()):r.type==="resetUrl"?(await this._context.globalState.update(be,void 0),this._updateWebview()):r.type==="refresh"&&this._updateWebview()}),e.onDidChangeVisibility(()=>{this._isVisible=e.visible,e.webview.postMessage({type:"visibilityChange",visible:e.visible}),e.visible&&this._onViewed?.()}),this._isVisible=!0,this._onViewed?.()}_updateWebview(){if(this._view){let e=this._context.globalState.get(be);this._view.webview.html=this._getHtmlForWebview(e)}}_openImagePanel(e){let s=g.window.createWebviewPanel("secreteChatImage","\uC774\uBBF8\uC9C0 \uBCF4\uAE30",g.ViewColumn.One,{enableScripts:!1});s.webview.html=`<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: https: http:; style-src 'unsafe-inline';">
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #1e1e1e;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            box-sizing: border-box;
        }
        img {
            max-width: 100%;
            max-height: calc(100vh - 40px);
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }
    </style>
</head>
<body>
    <img src="${e}" alt="\uC774\uBBF8\uC9C0" />
</body>
</html>`}_getHtmlForWebview(e){return e?this._getChatHtml(e):this._getUrlInputHtml()}_getUrlInputHtml(){let e="http://172.29.12.119:3000",s=this._getNonce();return`<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${s}';">
    <style>
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { 
            height: 100%; width: 100%; 
            background: #181818; 
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }
        .container {
            height: 100%;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            padding: 24px;
            animation: fadeIn 0.4s ease-out;
        }
        .icon {
            width: 56px; height: 56px;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            animation: float 3s ease-in-out infinite;
        }
        .icon svg {
            width: 28px; height: 28px;
            fill: white;
        }
        .title {
            color: #e0e0e0;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 6px;
            letter-spacing: -0.3px;
        }
        .subtitle {
            color: #6e6e6e;
            font-size: 12px;
            margin-bottom: 24px;
            text-align: center;
        }
        .input-group {
            width: 100%;
            max-width: 280px;
            animation: fadeIn 0.5s ease-out 0.1s both;
        }
        .label {
            color: #888;
            font-size: 11px;
            margin-bottom: 8px;
            display: block;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .input-wrapper {
            position: relative;
            background: #1f1f1f;
            border-radius: 12px;
            padding: 2px;
            box-shadow: 
                inset 2px 2px 4px #111,
                inset -1px -1px 3px #2a2a2a;
        }
        input {
            width: 100%;
            padding: 12px 14px;
            background: #232323;
            border: none;
            border-radius: 10px;
            color: #e0e0e0;
            font-size: 13px;
            outline: none;
            transition: all 0.2s ease;
        }
        input:focus {
            background: #282828;
            box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
        }
        input::placeholder {
            color: #555;
        }
        button {
            width: 100%;
            max-width: 280px;
            margin-top: 16px;
            padding: 12px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            animation: fadeIn 0.5s ease-out 0.2s both;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }
        button:active {
            transform: translateY(0);
        }
        button:disabled {
            background: linear-gradient(135deg, #3c3c3c 0%, #2d2d2d 100%);
            box-shadow: none;
            cursor: not-allowed;
            transform: none;
        }
        .spinner {
            width: 14px; height: 14px;
            border: 2px solid transparent;
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            display: none;
        }
        button:disabled .spinner {
            display: block;
        }
        button:disabled .btn-text {
            display: none;
        }
        .btn-icon {
            font-size: 14px;
        }
        .error {
            color: #f04c4d;
            font-size: 11px;
            margin-top: 12px;
            padding: 8px 12px;
            background: rgba(240, 76, 77, 0.1);
            border-radius: 8px;
            display: none;
            animation: fadeIn 0.2s ease-out;
        }
        .hint {
            color: #555;
            font-size: 10px;
            margin-top: 20px;
            text-align: center;
            animation: fadeIn 0.5s ease-out 0.3s both;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
                <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
            </svg>
        </div>
        <div class="title">Secrete Chat</div>
        <div class="subtitle">\uCC44\uD305 \uC11C\uBC84\uC5D0 \uC5F0\uACB0\uD558\uC138\uC694</div>
        <div class="input-group">
            <label class="label">\uC11C\uBC84 \uC8FC\uC18C</label>
            <div class="input-wrapper">
                <input type="text" id="urlInput" value="${e}" placeholder="http://localhost:3000">
            </div>
        </div>
        <button id="connectBtn">
            <span class="btn-icon">\u{1F680}</span>
            <span class="btn-text">\uC5F0\uACB0\uD558\uAE30</span>
            <div class="spinner"></div>
        </button>
        <div class="error" id="error"></div>
        <div class="hint">\uC11C\uBC84\uAC00 \uC2E4\uD589 \uC911\uC778\uC9C0 \uD655\uC778\uD558\uC138\uC694</div>
    </div>
    <script nonce="${s}">
        (function() {
            const vscode = acquireVsCodeApi();
            const input = document.getElementById('urlInput');
            const btn = document.getElementById('connectBtn');
            const error = document.getElementById('error');

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') connect();
            });

            input.addEventListener('input', () => {
                error.style.display = 'none';
            });

            btn.addEventListener('click', connect);

            function connect() {
                const url = input.value.trim();
                if (!url) {
                    showError('URL\uC744 \uC785\uB825\uD558\uC138\uC694');
                    return;
                }
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    showError('http:// \uB610\uB294 https://\uB85C \uC2DC\uC791\uD574\uC57C \uD569\uB2C8\uB2E4');
                    return;
                }
                btn.disabled = true;
                error.style.display = 'none';

                vscode.postMessage({ type: 'saveUrl', url: url });
            }

            function showError(msg) {
                error.textContent = msg;
                error.style.display = 'block';
                btn.disabled = false;
            }
        })();
    </script>
</body>
</html>`}_getChatHtml(e){let s=this._getNonce();return`<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src *; connect-src *; style-src 'unsafe-inline'; script-src 'nonce-${s}';">
    <style>
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes pulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes dots {
            0%, 20% { content: '.'; }
            40% { content: '..'; }
            60%, 100% { content: '...'; }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { 
            height: 100%; width: 100%; 
            background: #181818; 
            overflow: hidden;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }
        .header {
            height: 36px;
            background: linear-gradient(180deg, #1f1f1f 0%, #1a1a1a 100%);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 10px;
            border-bottom: 1px solid #2a2a2a;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .server-info {
            display: flex;
            align-items: center;
            gap: 6px;
            overflow: hidden;
            flex: 1;
        }
        .status-dot {
            width: 6px; height: 6px;
            background: #4caf50;
            border-radius: 50%;
            box-shadow: 0 0 6px rgba(76, 175, 80, 0.5);
            animation: pulse 2s ease-in-out infinite;
        }
        .status-dot.connecting {
            background: #ff9800;
            box-shadow: 0 0 6px rgba(255, 152, 0, 0.5);
        }
        .server-url {
            color: #888;
            font-size: 10px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .header-buttons {
            display: flex;
            gap: 4px;
        }
        .header-btn {
            background: transparent;
            border: 1px solid #3a3a3a;
            border-radius: 6px;
            color: #888;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .header-btn:hover {
            background: #2a2a2a;
            border-color: #444;
            color: #ccc;
        }
        .header-btn:active {
            transform: scale(0.95);
        }
        .header-btn svg {
            width: 12px;
            height: 12px;
            fill: currentColor;
        }
        .header-btn.spinning svg {
            animation: spin 0.8s linear infinite;
        }
        .content {
            height: calc(100% - 36px);
            position: relative;
            animation: fadeIn 0.3s ease-out;
        }
        .status {
            height: 100%;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            color: #ccc;
        }
        .loading-icon {
            width: 48px; height: 48px;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            animation: pulse 1.5s ease-in-out infinite;
        }
        .loading-icon svg {
            width: 24px; height: 24px;
            fill: white;
        }
        .loading-text { 
            font-size: 13px; 
            margin-bottom: 4px;
            color: #aaa;
        }
        .loading-text::after {
            content: '';
            animation: dots 1.5s steps(1) infinite;
        }
        .retry { 
            font-size: 11px; 
            color: #666;
            margin-top: 4px;
        }
        iframe { 
            width: 100%; height: 100%; 
            border: none; 
            display: none;
            animation: fadeIn 0.3s ease-out;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="server-info">
            <div class="status-dot connecting" id="statusDot"></div>
            <span class="server-url">${e}</span>
        </div>
        <div class="header-buttons">
            <button class="header-btn" id="refreshBtn" title="\uC0C8\uB85C\uACE0\uCE68">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
            </button>
            <button class="header-btn" id="changeBtn" title="\uC11C\uBC84 \uBCC0\uACBD">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                </svg>
            </button>
        </div>
    </div>
    <div class="content">
        <div class="status" id="status">
            <div class="loading-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
                    <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
                </svg>
            </div>
            <div class="loading-text">\uC11C\uBC84 \uC5F0\uACB0 \uC911</div>
            <div class="retry" id="retry">\uC2DC\uB3C4 1\uD68C</div>
        </div>
        <iframe id="frame" src="${e}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"></iframe>
    </div>
    <script nonce="${s}">
        (function() {
            const vscode = acquireVsCodeApi();
            const frame = document.getElementById('frame');
            const status = document.getElementById('status');
            const retry = document.getElementById('retry');
            const changeBtn = document.getElementById('changeBtn');
            const refreshBtn = document.getElementById('refreshBtn');
            const statusDot = document.getElementById('statusDot');
            const url = '${e}';
            let count = 0, interval = null;

            changeBtn.addEventListener('click', () => {
                vscode.postMessage({ type: 'resetUrl' });
            });

            refreshBtn.addEventListener('click', () => {
                refreshBtn.classList.add('spinning');
                frame.src = url;
                status.style.display = 'flex';
                frame.style.display = 'none';
                statusDot.classList.add('connecting');
                count = 0;
                if (!interval) {
                    interval = setInterval(check, 1000);
                }
                setTimeout(() => {
                    refreshBtn.classList.remove('spinning');
                }, 800);
            });

            function check() {
                count++;
                retry.textContent = '\uC2DC\uB3C4 ' + count + '\uD68C';
                fetch(url, { mode: 'no-cors' }).then(() => show()).catch(() => {});
            }
            function show() {
                frame.style.display = 'block';
                status.style.display = 'none';
                statusDot.classList.remove('connecting');
                if (interval) { clearInterval(interval); interval = null; }
            }
            frame.onload = show;
            interval = setInterval(check, 1000);
            check();

            window.addEventListener('message', (e) => {
                if (e.data && e.data.type === 'openUrl') {
                    vscode.postMessage({ type: 'openSimpleBrowser', url: e.data.url });
                } else if (e.data && e.data.type === 'openImage') {
                    vscode.postMessage({ type: 'openImage', url: e.data.url });
                } else if (e.data && e.data.type === 'visibilityChange') {
                    frame.contentWindow?.postMessage({ type: 'visibilityChange', visible: e.data.visible }, '*');
                }
            });
        })();
    </script>
</body>
</html>`}_getNonce(){let e="",s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(let i=0;i<32;i++)e+=s.charAt(Math.floor(Math.random()*s.length));return e}};function Dr(){}0&&(module.exports={activate,deactivate});
