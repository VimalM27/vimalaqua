'use strict';
// Local end-to-end harness (NOT deployed): serves the static site + admin APIs with an in-memory database.
process.env.SUPABASE_URL='https://x.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='svc';process.env.ADMIN_SESSION_SECRET='s'.repeat(40);process.env.ADMIN_DEV='1';
const http=require('http'),fs=require('fs'),path=require('path'),db=require('../server/db'),C=require('../server/crypto'),mem=require('./memdb')();
db.setDriver(mem);const {handle}=require('../server/router');const pub=require('../api/toys-content.js');
const ROOT=process.argv[2]; const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
(async()=>{
  mem._t.vp_admin_account=[{id:1,username:'owner',email:'owner@vimal27.in',password_hash:await C.hashPassword('Tr0pical-Mango-Sunrise!42')}];
  const now=new Date().toISOString();
  mem._t.vp_orders=[{id:'11111111-1111-4111-8111-111111111111',order_no:'VM27001',customer_name:'Asha',total:1250,order_status:'confirmed',payment_status:'paid',payment_method:'upi',created_at:now,paid_at:now,user_id:'u1'},{id:'22222222-2222-4222-8222-222222222222',order_no:'VM27002',customer_name:'Ravi',total:300,order_status:'pending_payment',payment_status:'pending',payment_method:'upi',created_at:now}];
  mem._t.vp_order_items=[{order_id:'11111111-1111-4111-8111-111111111111',name:'Chew Bone Toy',product_slug:'chew-bone-toy',qty:2,line_total:1250}];
  mem.authUserList=[{id:'u1',email:'asha@example.com',created_at:now,user_metadata:{name:'Asha'}}];
  http.createServer((req,res)=>{
    const u=new URL(req.url,'http://x');let p=u.pathname;
    if(p==='/admin'||p.startsWith('/admin/')){req.url='/api/admin/page?p='+encodeURIComponent(p.replace(/^\/admin\/?/,''));return handle(req,res);}
    if(p.startsWith('/api/admin/'))return handle(req,res);
    if(p==='/api/toys-content')return pub(req,res);
    if(p==='/')p='/index.html';const f=path.join(ROOT,p);
    if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end('nf');}
    res.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));
  }).listen(8124,()=>console.log('dev on 8124'));
})();
