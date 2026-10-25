export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto my-12 p-6 md:p-10 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-800 space-y-6 leading-relaxed text-sm md:text-base">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 border-b pb-4">
        全球百鐵認證暨普悠瑪聯合服務平台｜個人資料蒐集、處理及利用告知聲明與隱私權政策
      </h1>

      <p className="text-gray-600">
        歡迎您使用「全球百鐵認證」暨「普悠瑪鐵人三項」聯合資訊平台（以下簡稱「本平台」）。本平台由<strong>全球醫鐵有限公司</strong>負責系統建置與資料庫維運。為遵循中華民國《個人資料保護法》之規定，保障您的權益，請於註冊會員或填寫個人賽務資料前，詳細閱讀以下告知事項：
      </p>

      <h2 className="text-xl font-bold text-gray-900 pt-2">一、 蒐集之目的</h2>
      <p>本平台基於以下特定目的蒐集與利用您的個人資料：</p>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>○四○ 行銷</strong>（賽事與活動訊息推播）。</li>
        <li><strong>○六九 契約、類似契約或其他法律關係事務</strong>（包含賽事報名預填、完賽百鐵認證核發、旅平險及公共意外責任險投保）。</li>
        <li><strong>○九○ 消費者、客戶管理與服務</strong>（會員身分識別、歷屆賽事成績互通查詢、物資寄送與聯合商城購物服務）。</li>
        <li><strong>一三五 資（通）訊服務與資料庫管理</strong>。</li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 pt-2">二、 蒐集之個人資料類別</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>識別類</strong>：中英文姓名、E-mail、手機號碼、收件地址、身分證字號或護照號碼（僅供保險投保與實名認證）。</li>
        <li><strong>特徵與描述類</strong>：出生年月日、法定生理性別（配合競賽分組與保險規範）、衣物尺寸、襪子尺寸。</li>
        <li><strong>緊急聯絡人</strong>：姓名、關係及電話（賽事突發醫療事故聯繫用）。</li>
        <li><strong>專業資格</strong>：醫事人員或 EMT 救護執照資訊（醫護鐵人志工審核用）。</li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 pt-2">三、 個人資料利用之期間、地區與對象（兩網合一授權說明）</h2>
      <ol className="list-decimal pl-6 space-y-2">
        <li><strong>期間</strong>：自您同意註冊之日起，至您申請刪除帳號或本平台停止營運之日止。</li>
        <li><strong>地區</strong>：中華民國境內及本平台雲端主機所在地。</li>
        <li>
          <strong>利用對象與範圍</strong>：
          <ul className="list-disc pl-6 mt-1 space-y-1 text-gray-700">
            <li><strong>系統營運方</strong>：全球醫鐵有限公司（全球百鐵認證）。</li>
            <li><strong>賽事主辦方</strong>：當您主動報名普悠瑪鐵人三項賽事時，您同意授權本平台將該場次必要之報名與投保資料轉交予該賽事主辦單位（<strong>台東城鄉生活運動協會</strong>）及承辦保險公司。</li>
          </ul>
        </li>
      </ol>

      <h2 className="text-xl font-bold text-gray-900 pt-2">四、 當事人權利與帳號刪除機制</h2>
      <p>
        您可隨時至「會員中心」查詢、修改個資。若您欲申請完全刪除帳號與第三方登入綁定資料，可透過客服信箱提出，我們將於 15 個工作日內完成刪除。
      </p>

      <div className="bg-gray-50 p-4 rounded-lg border text-xs text-gray-500 mt-8">
        <p>系統維運單位：全球醫鐵有限公司</p>
        <p>合作賽事主辦單位：台東城鄉生活運動協會（普悠瑪鐵人三項）</p>
        <p>最後修訂日期：2026 年 10 月</p>
      </div>
    </div>
  );
}
