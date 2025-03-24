import{_ as Q,b as i,x as z,k as q,c as h,d as t,w,v as p,L as G,t as r,F as H,z as K,f as P,e as L,B as R,j as k,A as W,I as X,i as x,M as Y,J as Z,g as $,h as tt,o as y,y as D}from"./index-CgK7zKxJ.js";const st={name:"ManageUsers",setup(){const u=i([]),e=i(""),b=i("joinDate"),a=i("desc"),U=i(!1),v=i(null),c=i(0),m=i(""),s=i({totalUsers:0,totalCoins:0,averageTasksCompleted:0,bannedUsers:0}),f=async()=>{try{const o=R(k,"users"),n=await W(o);let l=0,C=0,g=0;const S=[];n.forEach(_=>{var M,j,B;const d=_.data();l+=d.coinBalance||0,C+=d.tasksCompleted||0,d.status==="banned"&&g++,S.push({uid:_.id,...d,referralCount:((M=d.referredUsers)==null?void 0:M.length)||0,lastActive:((j=d.lastActive)==null?void 0:j.toDate())||null,joinDate:((B=d.joinDate)==null?void 0:B.toDate())||null,status:d.status||"active"})}),u.value=S,s.value={totalUsers:u.value.length,totalCoins:l,averageTasksCompleted:C/u.value.length||0,bannedUsers:g},console.log("Fetched users:",u.value)}catch(o){console.error("Error fetching users:",o)}},E=z(()=>u.value.filter(o=>{var l,C,g;const n=e.value.toLowerCase();return((l=o.email)==null?void 0:l.toLowerCase().includes(n))||((C=o.displayName)==null?void 0:C.toLowerCase().includes(n))||((g=o.referralCode)==null?void 0:g.toLowerCase().includes(n))}).sort((o,n)=>{const l=a.value==="asc"?1:-1;switch(b.value){case"referralCount":return l*((o.referralCount||0)-(n.referralCount||0));case"lastActive":return o.lastActive?n.lastActive?l*(o.lastActive-n.lastActive):-1:1;default:return l*((o[b.value]||0)-(n[b.value]||0))}})),N=()=>{a.value=a.value==="asc"?"desc":"asc"},T=async o=>{const n=o.status==="banned"?"active":"banned";try{await X(x(k,"users",o.uid),{status:n,lastStatusUpdate:new Date,statusUpdateReason:n==="banned"?"Admin action":"Unbanned by admin"}),o.status=n,await f()}catch(l){console.error("Error updating user status:",l)}},I=o=>{v.value=o,U.value=!0},A=()=>{U.value=!1,v.value=null,c.value=0,m.value=""},V=async()=>{if(!(!v.value||!c.value))try{await Y(v.value.uid,c.value,m.value),await Z(R(k,"adminLogs"),{action:"adjust_coins",userId:v.value.uid,amount:c.value,reason:m.value,adminId:$.currentUser.uid,timestamp:new Date}),A(),await f()}catch(o){console.error("Error adjusting coins:",o)}},O=async o=>{try{const l=(await tt(x(k,"users",o))).data().referredUsers||[];console.log("User referrals:",l)}catch(n){console.error("Error fetching referrals:",n)}},F=o=>{if(!o)return"Never";const n={year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"};return new Date(o).toLocaleDateString("en-US",n)},J=o=>new Intl.NumberFormat("en-US").format(o);return q(()=>{f()}),{users:u,searchQuery:e,sortBy:b,sortOrder:a,showModal:U,selectedUser:v,coinAmount:c,transactionReason:m,sortedUsers:E,toggleSortOrder:N,toggleUserStatus:T,showTransactionModal:I,closeModal:A,adjustCoins:V,formatDate:F,userStats:s,viewReferrals:O,formatNumber:J}}},et={class:"users-container"},at={class:"page-header"},ot={class:"controls"},nt={class:"search-box"},lt={class:"filters"},rt={class:"table-container"},it={class:"users-table"},ct={class:"user-info"},dt={class:"user-details"},ut={class:"user-email"},vt={class:"actions-cell"},mt=["onClick"],ft=["onClick"],bt=["onClick"],Ct={class:"selected-user-info"},gt={class:"input-group"},ht={class:"input-group"},yt={class:"modal-actions"},Ut=["disabled"];function wt(u,e,b,a,U,v){var c,m;return y(),h("div",et,[t("div",at,[e[11]||(e[11]=t("h2",null,"👥 Manage Users",-1)),t("div",ot,[t("div",nt,[e[9]||(e[9]=t("span",{class:"search-icon"},"🔍",-1)),w(t("input",{"onUpdate:modelValue":e[0]||(e[0]=s=>a.searchQuery=s),type:"text",placeholder:"Search by name or email...",class:"search-input"},null,512),[[p,a.searchQuery]])]),t("div",lt,[w(t("select",{"onUpdate:modelValue":e[1]||(e[1]=s=>a.sortBy=s),class:"filter-select"},e[10]||(e[10]=[t("option",{value:"joinDate"},"Sort by Join Date",-1),t("option",{value:"coinBalance"},"Sort by Coins",-1),t("option",{value:"tasksCompleted"},"Sort by Tasks",-1)]),512),[[G,a.sortBy]]),t("button",{onClick:e[2]||(e[2]=(...s)=>a.toggleSortOrder&&a.toggleSortOrder(...s)),class:"sort-button"},r(a.sortOrder==="asc"?"⬆️":"⬇️"),1)])])]),t("div",rt,[t("table",it,[e[12]||(e[12]=t("thead",null,[t("tr",null,[t("th",null,"User Info"),t("th",null,"Join Date"),t("th",null,"Coins"),t("th",null,"Tasks"),t("th",null,"Referrals"),t("th",null,"Last Active"),t("th",null,"Status"),t("th",null,"Actions")])],-1)),t("tbody",null,[(y(!0),h(H,null,K(a.sortedUsers,s=>(y(),h("tr",{key:s.uid,class:D({banned:s.status==="banned"})},[t("td",ct,[t("div",dt,[t("strong",null,r(s.name||"Anonymous"),1),t("span",ut,r(s.email),1)])]),t("td",null,r(a.formatDate(s.joinDate)),1),t("td",null,r(s.coinBalance||0)+" 🪙",1),t("td",null,r(s.taskCount||0)+" ✅",1),t("td",null,r(a.formatNumber(s.referralCount)),1),t("td",null,r(a.formatDate(s.lastActive)),1),t("td",null,[t("span",{class:D(["status-badge",s.status||"active"])},r(s.status||"active"),3)]),t("td",vt,[t("button",{onClick:f=>a.toggleUserStatus(s),class:D(["status-toggle",s.status==="banned"?"unban":"ban"])},r(s.status==="banned"?"🔓":"🔒"),11,mt),t("button",{onClick:f=>a.showTransactionModal(s),class:"adjust-coins"}," 💰 ",8,ft),s.referralCount>0?(y(),h("button",{key:0,onClick:f=>a.viewReferrals(s.uid),class:"view-referrals"}," 👥 ",8,bt)):L("",!0)])],2))),128))])])]),a.showModal?(y(),h("div",{key:0,class:"modal-overlay",onClick:e[8]||(e[8]=(...s)=>a.closeModal&&a.closeModal(...s))},[t("div",{class:"modal-content",onClick:e[7]||(e[7]=P(()=>{},["stop"]))},[e[15]||(e[15]=t("h3",null,"Adjust Coins",-1)),t("p",Ct,r(((c=a.selectedUser)==null?void 0:c.displayName)||"Anonymous")+" ("+r((m=a.selectedUser)==null?void 0:m.email)+") ",1),t("div",gt,[e[13]||(e[13]=t("label",null,"Amount:",-1)),w(t("input",{"onUpdate:modelValue":e[3]||(e[3]=s=>a.coinAmount=s),type:"number",class:"coin-input",placeholder:"Enter amount"},null,512),[[p,a.coinAmount,void 0,{number:!0}]])]),t("div",ht,[e[14]||(e[14]=t("label",null,"Reason:",-1)),w(t("textarea",{"onUpdate:modelValue":e[4]||(e[4]=s=>a.transactionReason=s),class:"reason-input",placeholder:"Enter reason for adjustment",rows:"3"},null,512),[[p,a.transactionReason]])]),t("div",yt,[t("button",{onClick:e[5]||(e[5]=(...s)=>a.closeModal&&a.closeModal(...s)),class:"cancel-button"},"Cancel"),t("button",{onClick:e[6]||(e[6]=(...s)=>a.adjustCoins&&a.adjustCoins(...s)),class:"confirm-button",disabled:!a.coinAmount||!a.transactionReason}," Confirm ",8,Ut)])])])):L("",!0)])}const pt=Q(st,[["render",wt],["__scopeId","data-v-dfc97e4b"]]);export{pt as default};
