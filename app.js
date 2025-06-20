// Remove imports as they're not needed in browser environment
// Icons are available from the global scope defined in index.html

// 定数定義（2025年度最新データ）
const CONSTANTS = {
  PENSION_MONTHLY: 17510, // 2025年度国民年金保険料（月額）
  KAIGO_65_OVER_YEARLY: 85000, // 65歳以上介護保険料（全国平均概算）
  BASIC_DEDUCTION: 480000, // 基礎控除額（所得税ベース）
  BASIC_DEDUCTION_RESIDENT: 430000, // 基礎控除額（住民税ベース・軽減判定用）
  // 東京都葛飾区の料率（2025年度・都内最高水準）
  TOKYO_RATES: {
    medical: { incomeRate: 0.0869, capita: 49100, maxAmount: 650000 },
    support: { incomeRate: 0.0280, capita: 16500, maxAmount: 240000 },
    nursing: { incomeRate: 0.0236, capita: 16500, maxAmount: 170000 },
    totalMaxAmount: 1060000 // 2025年度上限額
  },
  JIGYONUSHI: {
    SINGLE: 38500,
    FAMILY: 40000
  }
};

// ユーティリティ関数
const formatNumber = (num) => num.toLocaleString();

const calculateTaxDeduction = (taxReturnType) => {
  const deductions = {
    'blue-65': 650000,
    'blue-55': 550000,
    'blue-10': 100000,
    'white': 0
  };
  return deductions[taxReturnType] || 0;
};

const getSpouseRangeInfo = (spouse, spouseIncome, spouseAge) => {
  if (!spouse || !spouseIncome) return null;
  const spouseIncomeNum = parseFloat(spouseIncome);
  const limit = parseInt(spouseAge) >= 60 ? 180 : 130;
  const isInRange = spouseIncomeNum < limit;
  return {
    isInRange,
    limit,
    message: isInRange 
      ? `✓ 社会保険の扶養範囲内（年収${limit}万円未満）` 
      : `✗ 社会保険の扶養範囲外（年収${limit}万円以上）`
  };
};

// CTAコンポーネント
const CTASection = ({ title, subtitle, benefits, buttonText, bgColor, isResults, results }) => (
  <div className={`my-8 ${bgColor} rounded-xl p-6 text-white shadow-lg`}>
    <div className="flex items-start mb-5">
      <div className="text-3xl mr-4">💡</div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm opacity-90 mb-4">{subtitle}</p>
        {isResults && results && results.comparison.isJigyonushiBetter && (
          <div className="bg-white bg-opacity-20 p-3 rounded-lg mb-4 font-semibold text-center">
            🎉 事業主共生連で月額{Math.abs(results.comparison.differenceMonthly).toLocaleString()}円の節約が可能です！
          </div>
        )}
        <ul className="text-sm space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="opacity-95">{benefit}</li>
          ))}
        </ul>
      </div>
    </div>
    <a 
      href="https://lin.ee/GCnNh3B" 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center w-full bg-white bg-opacity-95 text-gray-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white transition-all duration-300 hover:-translate-y-1"
    >
      <span>{buttonText}</span>
      <i data-lucide="external-link" className="ml-2 w-5 h-5"></i>
    </a>
  </div>
);

// 基本情報フォームコンポーネント
const BasicInfoForm = ({ 
  income, setIncome, 
  age, setAge, 
  doTaxReturn, setDoTaxReturn,
  taxReturnType, setTaxReturnType,
  spouse, setSpouse,
  spouseAge, setSpouseAge,
  spouseIncome, setSpouseIncome,
  childrenOver20InDependentRange, setChildrenOver20InDependentRange,
  canProvideDependency, setCanProvideDependency
}) => {
  const spouseRangeInfo = getSpouseRangeInfo(spouse, spouseIncome, spouseAge);

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <i data-lucide="file-text" className="w-5 h-5 mr-2 text-blue-600"></i>
        基本情報・家族構成
      </h2>
      
      <div className="space-y-4">
        {/* 年間所得 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            年間所得（万円）
          </label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="300"
          />
          <div className="mt-1 flex items-start">
            <i data-lucide="info" className="w-4 h-4 text-gray-500 mr-1 flex-shrink-0 mt-0.5"></i>
            <div className="text-xs text-gray-600">
              <p>売上（収入）から必要経費を差し引いた金額です。</p>
              <p className="mt-1">確定申告書では「所得金額」の欄に記載される金額を入力してください。</p>
              <p className="mt-1">例：売上500万円－経費200万円＝所得300万円</p>
            </div>
          </div>
        </div>
        
        {/* 年齢 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">年齢</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* 確定申告 */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={doTaxReturn}
              onChange={(e) => setDoTaxReturn(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">確定申告をする</span>
          </label>
          <p className="text-xs text-gray-500 ml-6 mt-1">
            個人事業主として確定申告を行う場合はチェックを入れてください
          </p>
          {doTaxReturn && (
            <>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">申告の種類</label>
                <select
                  value={taxReturnType}
                  onChange={(e) => setTaxReturnType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="blue-65">青色申告（65万円控除）</option>
                  <option value="blue-55">青色申告（55万円控除）</option>
                  <option value="blue-10">青色申告（10万円控除）</option>
                  <option value="white">白色申告</option>
                </select>
              </div>
              <div className="mt-2 space-y-1 text-xs text-gray-600">
                <p><strong>青色申告（65万円控除）</strong>：複式簿記で記帳し、e-Taxで申告する場合</p>
                <p><strong>青色申告（55万円控除）</strong>：複式簿記で記帳し、紙で申告する場合</p>
                <p><strong>青色申告（10万円控除）</strong>：簡易簿記で記帳している場合</p>
                <p><strong>白色申告</strong>：青色申告の承認を受けていない場合（特別控除なし）</p>
              </div>
            </>
          )}
        </div>
        
        {/* 配偶者 */}
        <div className="border-t pt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={spouse}
              onChange={(e) => {
                setSpouse(e.target.checked);
                setSpouseIncome(e.target.checked ? '100' : '0');
              }}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">配偶者あり</span>
          </label>
          <p className="text-xs text-gray-500 ml-6 mt-1">
            結婚している場合はチェックを入れてください
          </p>
          {spouse && (
            <div className="mt-2 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">配偶者の年齢</label>
                <input
                  type="number"
                  value={spouseAge}
                  onChange={(e) => setSpouseAge(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="40"
                />
                <p className="text-xs text-gray-500 mt-1">介護保険（40-64歳）と国民年金（20-59歳）の計算に使用します</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">配偶者の年収（万円）</label>
                <input
                  type="number"
                  value={spouseIncome}
                  onChange={(e) => setSpouseIncome(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  パート収入、個人事業収入など、配偶者の全ての収入の合計を入力してください。収入がない場合は0を入力。
                </p>
                {spouseRangeInfo && (
                  <p className={`text-xs mt-1 ${spouseRangeInfo.isInRange ? 'text-green-600' : 'text-gray-600'}`}>
                    {spouseRangeInfo.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* 20歳以上の子ども */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">20歳以上の子どもの人数</label>
          <input
            type="number"
            value={childrenOver20InDependentRange}
            onChange={(e) => setChildrenOver20InDependentRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
          />
          <div className="mt-1 flex items-start">
            <i data-lucide="info" className="w-4 h-4 text-gray-500 mr-1 flex-shrink-0 mt-0.5"></i>
            <div className="text-xs text-gray-600">
              <p>20歳以上の子どもの人数です。国民健康保険には扶養制度がないため、収入に関わらず全員が被保険者となります。</p>
              <p className="mt-1">例：大学生、無職の成人した子どもなど</p>
              <p className="mt-1">20歳以上60歳未満の子どもは国民年金の支払い対象となります。</p>
            </div>
          </div>
        </div>
        
        {/* 扶養予定同居人チェック */}
        <div className="border-t pt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={canProvideDependency}
              onChange={(e) => setCanProvideDependency(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">その他同居人を扶養に入れる場合の節約額を計算</span>
          </label>
          <p className="text-xs text-gray-500 ml-6 mt-1">
            あなたが事業主共生連に加入した場合、扶養に入れられる同居人の保険料節約額を計算します
          </p>
        </div>
      </div>
    </div>
  );
};

// 扶養予定同居人入力コンポーネント
const DependentPersonInput = ({ person, index, type, onChange }) => (
  <div className="p-3 bg-white rounded border">
    <p className="text-sm font-medium text-gray-700 mb-2">
      {type}{index + 1}人目の情報
    </p>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-xs text-gray-600 mb-1">年齢</label>
        <input
          type="number"
          value={person.age}
          onChange={(e) => onChange(index, 'age', e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          min={type === '親' ? "60" : "0"}
          max="74"
        />
        {type === '親' && <p className="text-xs text-gray-500 mt-1">75歳以上は後期高齢者医療制度</p>}
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">年収（万円）</label>
        <input
          type="number"
          value={person.income}
          onChange={(e) => onChange(index, 'income', e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          min="0"
          max={type === '親' ? "180" : "130"}
        />
      </div>
    </div>
  </div>
);

// 扶養予定同居人フォームコンポーネント
const DependentForm = ({ 
  canProvideDependency, 
  dependentParentsCount, setDependentParentsCount,
  dependentOthersCount, setDependentOthersCount,
  dependentParents, setDependentParents,
  dependentOthers, setDependentOthers
}) => {
  const updateDependentParents = (count) => {
    const numCount = parseInt(count) || 0;
    setDependentParentsCount(count);
    const newParents = [];
    for (let i = 0; i < numCount; i++) {
      newParents.push(dependentParents[i] || { age: '70', income: '80' });
    }
    setDependentParents(newParents);
  };

  const updateDependentOthers = (count) => {
    const numCount = parseInt(count) || 0;
    setDependentOthersCount(count);
    const newOthers = [];
    for (let i = 0; i < numCount; i++) {
      newOthers.push(dependentOthers[i] || { age: '30', income: '80' });
    }
    setDependentOthers(newOthers);
  };

  const handleParentChange = (index, field, value) => {
    const newParents = [...dependentParents];
    newParents[index][field] = value;
    setDependentParents(newParents);
  };

  const handleOtherChange = (index, field, value) => {
    const newOthers = [...dependentOthers];
    newOthers[index][field] = value;
    setDependentOthers(newOthers);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <i data-lucide="users" className="w-5 h-5 mr-2 text-blue-600"></i>
        扶養予定同居人
      </h2>
      
      {canProvideDependency ? (
        <div className="space-y-4">
          {/* 親の人数入力 */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              扶養に入れる親（60歳以上）の人数
            </label>
            <input
              type="number"
              value={dependentParentsCount}
              onChange={(e) => updateDependentParents(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              max="4"
            />
            <p className="text-xs text-gray-500 mt-1">
              年収180万円未満で同居または仕送りをしている親の人数
            </p>
          </div>
          
          {/* 親の詳細情報 */}
          {dependentParents.map((parent, index) => (
            <DependentPersonInput
              key={`parent-${index}`}
              person={parent}
              index={index}
              type="親"
              onChange={handleParentChange}
            />
          ))}
          
          {/* その他同居人の人数入力 */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              扶養に入れるその他の同居人の人数
            </label>
            <input
              type="number"
              value={dependentOthersCount}
              onChange={(e) => updateDependentOthers(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              max="10"
            />
            <p className="text-xs text-gray-500 mt-1">
              年収130万円未満で同居している同居人（兄弟姉妹、祖父母など）の人数
            </p>
          </div>
          
          {/* その他同居人の詳細情報 */}
          {dependentOthers.map((other, index) => (
            <DependentPersonInput
              key={`other-${index}`}
              person={other}
              index={index}
              type="その他同居人"
              onChange={handleOtherChange}
            />
          ))}
          
          <div className="p-3 bg-yellow-50 rounded">
            <p className="text-xs text-yellow-700">
              <i data-lucide="info" className="inline w-4 h-4 mr-1"></i>
              扶養に入れる同居人の概算保険料を平均値で計算します。実際の保険料は各人の年齢・所得により異なります。
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <i data-lucide="users" className="w-12 h-12 mx-auto mb-3 opacity-50"></i>
          <p className="text-sm">左側の「その他同居人を扶養に入れる場合の節約額を計算」にチェックを入れると、扶養予定同居人の情報を入力できます。</p>
        </div>
      )}
    </div>
  );
};

// 個人別保険料詳細テーブルコンポーネント
const PersonalInsuranceTable = ({ results, income, spouse, spouseIncome }) => (
  <div className="mb-6 bg-white p-6 rounded shadow">
    <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
      <Users className="w-5 h-5 mr-2 text-blue-600" />
      個人別保険料詳細
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 text-left border">対象者</th>
            <th className="px-3 py-2 text-right border">国民健康保険</th>
            <th className="px-3 py-2 text-right border">国民年金</th>
            <th className="px-3 py-2 text-right border">介護保険(65歳+)</th>
            <th className="px-3 py-2 text-right border">月額合計</th>
          </tr>
        </thead>
        <tbody>
          {/* 本人 */}
          <tr className="border-b">
            <td className="px-3 py-3 border">
              <div className="font-medium">本人（{results.details.userAge}歳）</div>
              <div className="text-xs text-gray-500">年収{income}万円</div>
            </td>
            <td className="px-3 py-3 text-right border">
              <div className="space-y-1">
                <div className="text-xs">医療: {formatNumber(Math.floor(results.healthInsurance.individual.self.medical/12))}円</div>
                <div className="text-xs">支援: {formatNumber(Math.floor(results.healthInsurance.individual.self.support/12))}円</div>
                {results.healthInsurance.individual.self.nursing > 0 && (
                  <div className="text-xs">介護: {formatNumber(Math.floor(results.healthInsurance.individual.self.nursing/12))}円</div>
                )}
                <div className="font-semibold pt-1 border-t">{formatNumber(Math.floor(results.healthInsurance.individual.self.total/12))}円</div>
              </div>
            </td>
            <td className="px-3 py-3 text-right border">
              <div className="font-semibold">
                {results.pension.monthly > 0 ? `${formatNumber(CONSTANTS.PENSION_MONTHLY)}円` : '0円'}
              </div>
              {results.details.userAge < 20 && <div className="text-xs text-gray-500">20歳未満</div>}
              {results.details.userAge >= 60 && <div className="text-xs text-gray-500">60歳以上</div>}
            </td>
            <td className="px-3 py-3 text-right border">
              {results.kaigo65Over.self > 0 ? (
                <div className="font-semibold">{formatNumber(Math.floor(results.kaigo65Over.self/12))}円</div>
              ) : (
                <div className="text-gray-400">-</div>
              )}
            </td>
            <td className="px-3 py-3 text-right border">
              <div className="text-lg font-bold text-blue-600">
                {formatNumber(Math.floor(results.healthInsurance.individual.self.total/12) + results.pension.monthly + Math.floor(results.kaigo65Over.self/12))}円
              </div>
            </td>
          </tr>
          
          {/* 配偶者 */}
          {spouse && results.healthInsurance.individual.spouse && (
            <tr className="border-b">
              <td className="px-3 py-3 border">
                <div className="font-medium">配偶者（{results.details.userSpouseAge}歳）</div>
                <div className="text-xs text-gray-500">年収{spouseIncome}万円</div>
              </td>
              <td className="px-3 py-3 text-right border">
                <div className="space-y-1">
                  <div className="text-xs">医療: {formatNumber(Math.floor(results.healthInsurance.individual.spouse.medical/12))}円</div>
                  <div className="text-xs">支援: {formatNumber(Math.floor(results.healthInsurance.individual.spouse.support/12))}円</div>
                  {results.healthInsurance.individual.spouse.nursing > 0 && (
                    <div className="text-xs">介護: {formatNumber(Math.floor(results.healthInsurance.individual.spouse.nursing/12))}円</div>
                  )}
                  <div className="font-semibold pt-1 border-t">{formatNumber(Math.floor(results.healthInsurance.individual.spouse.total/12))}円</div>
                </div>
              </td>
              <td className="px-3 py-3 text-right border">
                <div className="font-semibold">
                  {results.spousePension.monthly > 0 ? `${formatNumber(CONSTANTS.PENSION_MONTHLY)}円` : '0円'}
                </div>
                {results.details.userSpouseAge < 20 && <div className="text-xs text-gray-500">20歳未満</div>}
                {results.details.userSpouseAge >= 60 && <div className="text-xs text-gray-500">60歳以上</div>}
              </td>
              <td className="px-3 py-3 text-right border">
                {results.kaigo65Over.spouse > 0 ? (
                  <div className="font-semibold">{formatNumber(Math.floor(results.kaigo65Over.spouse/12))}円</div>
                ) : (
                  <div className="text-gray-400">-</div>
                )}
              </td>
              <td className="px-3 py-3 text-right border">
                <div className="text-lg font-bold text-blue-600">
                  {formatNumber(Math.floor(results.healthInsurance.individual.spouse.total/12) + results.spousePension.monthly + Math.floor(results.kaigo65Over.spouse/12))}円
                </div>
              </td>
            </tr>
          )}
          
          {/* 20歳以上の子ども */}
          {results.healthInsurance.individual.children && results.healthInsurance.individual.children.map((child, index) => (
            <tr key={`child-${index}`} className="border-b">
              <td className="px-3 py-3 border">
                <div className="font-medium">
                  20歳以上の子ども{results.healthInsurance.individual.children.length > 1 ? ` ${index + 1}` : ''}
                </div>
                <div className="text-xs text-gray-500">所得なしと仮定</div>
              </td>
              <td className="px-3 py-3 text-right border">
                <div className="space-y-1">
                  <div className="text-xs">医療: {formatNumber(Math.floor(child.medical/12))}円</div>
                  <div className="text-xs">支援: {formatNumber(Math.floor(child.support/12))}円</div>
                  <div className="text-xs">介護: 0円</div>
                  <div className="font-semibold pt-1 border-t">{formatNumber(Math.floor(child.total/12))}円</div>
                </div>
              </td>
              <td className="px-3 py-3 text-right border">
                <div className="font-semibold">{formatNumber(CONSTANTS.PENSION_MONTHLY)}円</div>
              </td>
              <td className="px-3 py-3 text-right border">
                <div className="text-gray-400">-</div>
              </td>
              <td className="px-3 py-3 text-right border">
                <div className="text-lg font-bold text-blue-600">
                  {formatNumber(Math.floor(child.total/12) + CONSTANTS.PENSION_MONTHLY)}円
                </div>
              </td>
            </tr>
          ))}
          
          {/* 扶養予定同居人 */}
          {results.provideDependency.checked && results.provideDependency.details && results.provideDependency.details.map((member, index) => (
            <tr key={`dependent-${index}`} className="border-b bg-yellow-50">
              <td className="px-3 py-3 border">
                <div className="font-medium">{member.type}（{member.age}歳）</div>
                <div className="text-xs text-orange-600">年収{member.income}万円・現在各自加入</div>
              </td>
              <td className="px-3 py-3 text-right border">
                <div className="font-semibold">{formatNumber(Math.floor((member.total - (member.age >= 20 && member.age < 60 ? CONSTANTS.PENSION_MONTHLY * 12 : 0) - (member.age >= 65 ? CONSTANTS.KAIGO_65_OVER_YEARLY : 0))/12))}円</div>
                <div className="text-xs text-gray-500">概算</div>
              </td>
              <td className="px-3 py-3 text-right border">
                <div className="font-semibold">
                  {member.age >= 20 && member.age < 60 ? `${formatNumber(CONSTANTS.PENSION_MONTHLY)}円` : '0円'}
                </div>
              </td>
              <td className="px-3 py-3 text-right border">
                {member.age >= 65 ? (
                  <div className="font-semibold">{formatNumber(Math.floor(CONSTANTS.KAIGO_65_OVER_YEARLY/12))}円</div>
                ) : (
                  <div className="text-gray-400">-</div>
                )}
              </td>
              <td className="px-3 py-3 text-right border">
                <div className="text-lg font-bold text-orange-600">
                  {formatNumber(Math.floor(member.total/12))}円
                </div>
              </td>
            </tr>
          ))}
          
          {/* 合計行 */}
          <tr className="bg-gray-100 font-bold">
            <td className="px-3 py-3 border">世帯合計</td>
            <td className="px-3 py-3 text-right border">{formatNumber(results.healthInsurance.monthly)}円</td>
            <td className="px-3 py-3 text-right border">
              {formatNumber(results.pension.monthly + results.spousePension.monthly + results.childrenPension.monthly + 
                (results.provideDependency.checked ? 
                  results.provideDependency.details.filter(m => m.age >= 20 && m.age < 60).length * CONSTANTS.PENSION_MONTHLY : 0))}円
            </td>
            <td className="px-3 py-3 text-right border">
              {formatNumber(Math.floor(results.kaigo65Over.total/12) + 
                (results.provideDependency.checked ? 
                  results.provideDependency.details.filter(m => m.age >= 65).length * Math.floor(CONSTANTS.KAIGO_65_OVER_YEARLY/12) : 0))}円
            </td>
            <td className="px-3 py-3 text-right border">
              <div className="text-xl text-blue-600">{formatNumber(results.total.monthly)}円</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="mt-4 text-xs text-gray-600 space-y-1">
      <p>※ 国民健康保険料は世帯単位で計算されますが、各個人の負担目安として表示しています</p>
      <p>※ 国民健康保険には扶養制度がないため、世帯全員が被保険者となります</p>
      <p>※ 20歳以上60歳未満の方は国民年金の支払いが必要です</p>
      <p>※ 65歳以上の方は介護保険料（第1号被保険者）が別途必要です</p>
      {results.provideDependency.checked && results.provideDependency.totalSavings > 0 && (
        <p>※ 扶養予定同居人の保険料は現在各自で支払っている金額です</p>
      )}
    </div>
  </div>
);

// 結果表示メインコンポーネント
const ResultsDisplay = ({ results, income, spouse, spouseIncome, showDetails, setShowDetails }) => (
  <div className="bg-blue-50 p-6 rounded-lg">
    <h2 className="text-xl font-bold mb-6 text-gray-800">📊 計算結果</h2>
    
    {/* メイン判定結果 */}
    <div className={`mb-8 p-8 rounded-xl border-4 text-center ${
      results.comparison.isJigyonushiBetter 
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400' 
        : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-400'
    }`}>
      <div className="flex justify-center mb-4">
        {results.comparison.isJigyonushiBetter ? (
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
            <i data-lucide="check-circle" className="w-12 h-12 text-white"></i>
          </div>
        ) : (
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center">
            <i data-lucide="x-circle" className="w-12 h-12 text-white"></i>
          </div>
        )}
      </div>
      
      {results.comparison.isJigyonushiBetter ? (
        <>
          <h3 className="text-3xl font-bold text-green-800 mb-4">
            🎉 事業主共生連の方がお得です！
          </h3>
          <div className="text-5xl font-bold text-green-600 mb-4">
            月額 {formatNumber(Math.abs(results.comparison.differenceMonthly))}円 節約
          </div>
          <div className="text-2xl text-green-700 mb-6">
            年間で {formatNumber(Math.abs(results.comparison.differenceYearly))}円 の節約効果
          </div>
          <div className="bg-white bg-opacity-80 p-4 rounded-lg">
            <p className="text-lg font-semibold text-green-800">
              事業主共生連に切り替えることで大幅な保険料削減が可能です
            </p>
            <p className="text-sm text-green-700 mt-2">
              さらに厚生年金により将来の年金受給額も増加します
            </p>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-3xl font-bold text-orange-800 mb-4">
            現在の保険料の方が安いです
          </h3>
          <div className="text-4xl font-bold text-orange-600 mb-4">
            月額 {formatNumber(Math.abs(results.comparison.differenceMonthly))}円 の差額
          </div>
          <div className="text-xl text-orange-700 mb-6">
            年間で {formatNumber(Math.abs(results.comparison.differenceYearly))}円 の差額
          </div>
          <div className="bg-white bg-opacity-80 p-4 rounded-lg">
            <p className="text-lg font-semibold text-orange-800">
              現在の保険料の方が経済的です
            </p>
            <p className="text-sm text-orange-700 mt-2">
              ただし、将来の年金額や保障内容を考慮すると事業主共生連にもメリットがあります
            </p>
          </div>
        </>
      )}
    </div>
    
    {/* 現在の保険料内訳 */}
    <div className="mb-6 bg-white p-4 rounded shadow">
      <h3 className="font-semibold text-gray-700 mb-3">現在の保険料内訳</h3>
      <div className="space-y-2 text-sm">
        <p><strong>国民健康保険料:</strong> 年額 {formatNumber(results.healthInsurance.yearly)}円（月額 {formatNumber(results.healthInsurance.monthly)}円）</p>
        <p><strong>国民年金保険料:</strong> 年額 {formatNumber(results.pension.yearly + results.spousePension.yearly + results.childrenPension.yearly)}円（月額 {formatNumber(results.pension.monthly + results.spousePension.monthly + results.childrenPension.monthly)}円）</p>
        {results.kaigo65Over.total > 0 && (
          <p><strong>介護保険料（65歳以上）:</strong> 年額 {formatNumber(results.kaigo65Over.total)}円（月額 {formatNumber(Math.floor(results.kaigo65Over.total/12))}円）</p>
        )}
        {results.provideDependency.checked && results.provideDependency.totalSavings > 0 && (
          <p><strong>扶養予定同居人の保険料:</strong> 年額 {formatNumber(results.provideDependency.totalSavings)}円（月額 {formatNumber(results.provideDependency.monthlySavings)}円）</p>
        )}
        {results.details.taxReturnDeduction > 0 && (
          <p className="text-blue-600 font-bold">✓ {
            results.details.taxReturnType === 'blue-65' ? '青色申告（65万円控除）' :
            results.details.taxReturnType === 'blue-55' ? '青色申告（55万円控除）' :
            results.details.taxReturnType === 'blue-10' ? '青色申告（10万円控除）' :
            '白色申告'
          }が適用されています</p>
        )}
        {results.details.reductionType !== 'なし' && (
          <p className="text-green-600 font-bold">✓ {results.details.reductionType}が適用されています</p>
        )}
      </div>
    </div>
    
    {/* 個人別保険料詳細テーブル */}
    <PersonalInsuranceTable results={results} income={income} spouse={spouse} spouseIncome={spouseIncome} />
    
    {/* 比較表示 */}
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      <div className="bg-red-50 border-2 border-red-400 p-4 rounded text-center">
        <h3 className="font-semibold text-gray-700 mb-2">現在の保険料</h3>
        <div className="text-2xl font-bold text-red-600 mb-2">月額: {formatNumber(results.total.monthly)}円</div>
        <div className="text-gray-600">年額: {formatNumber(results.total.yearly)}円</div>
        <p className="text-sm mt-2">世帯{results.details.familyMembers}人分の保険料</p>
      </div>
      
      <div className="bg-green-50 border-2 border-green-400 p-4 rounded text-center">
        <h3 className="font-semibold text-gray-700 mb-2">事業主共生連</h3>
        <div className="text-2xl font-bold text-green-600 mb-2">月額: {formatNumber(results.comparison.jigyonushiMonthly)}円</div>
        <div className="text-gray-600">年額: {formatNumber(results.comparison.jigyonushiYearly)}円</div>
        <p className="text-sm mt-2">{results.comparison.hasFamily ? '家族プラン' : '独身プラン'}（扶養可能）</p>
        <div className="mt-3 text-sm text-gray-500">
          <p>• 社会保険・厚生年金込み</p>
          <p>• <strong className="text-blue-600">介護保険料（40-64歳）も含む</strong></p>
          <p>• 家族の扶養可能（保険料追加なし）</p>
          {results.provideDependency.checked && results.provideDependency.totalSavings > 0 && (
            <p className="text-blue-600 font-semibold">• 扶養で{results.provideDependency.details.length}人分の保険料が無料に！</p>
          )}
        </div>
      </div>
    </div>
    
    {/* 扶養予定同居人の詳細 */}
    {results.provideDependency.checked && results.provideDependency.details.length > 0 && (
      <div className="mt-6 bg-green-50 p-4 rounded">
        <h4 className="font-semibold text-gray-700 mb-2">扶養予定同居人の現在の保険料</h4>
        {results.provideDependency.details.map((member, index) => (
          <p key={index} className="text-sm">
            • {member.type}（{member.age}歳・年収{member.income}万円）: 年額 {formatNumber(member.total)}円
          </p>
        ))}
      </div>
    )}
  </div>
);

// 計算式詳細コンポーネント
const CalculationDetails = ({ results, showDetails, setShowDetails }) => (
  <div className="mt-6">
    <button
      onClick={() => setShowDetails(!showDetails)}
      className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
    >
      計算式の詳細を{showDetails ? '隠す' : '見る'}
      {showDetails ? <i data-lucide="chevron-up" className="ml-1 w-4 h-4"></i> : <i data-lucide="chevron-down" className="ml-1 w-4 h-4"></i>}
    </button>
    
    {showDetails && (
      <div className="mt-4 bg-gray-50 p-6 rounded-lg text-sm">
        <h3 className="font-bold mb-3 text-lg">計算式の詳細</h3>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded">
            <h4 className="font-semibold mb-2">1. 課税所得の計算</h4>
            <p>年間所得: {formatNumber(results.details.originalIncome)}円</p>
            {results.details.taxReturnDeduction > 0 && (
              <p>－ 確定申告による控除: {formatNumber(results.details.taxReturnDeduction)}円（{
                results.details.taxReturnType === 'blue-65' ? '青色申告65万円控除' :
                results.details.taxReturnType === 'blue-55' ? '青色申告55万円控除' :
                results.details.taxReturnType === 'blue-10' ? '青色申告10万円控除' :
                '白色申告'
              }）</p>
            )}
            <p>－ 基礎控除: {formatNumber(results.details.basicDeduction)}円</p>
            <p className="font-semibold mt-2">
              = 課税所得（基準額）: {formatNumber(results.details.incomeBase)}円
            </p>
          </div>
          
          <div className="bg-white p-4 rounded">
            <h4 className="font-semibold mb-2">2. 国民健康保険料の計算</h4>
            <div className="space-y-2">
              <p>医療分: {formatNumber(results.healthInsurance.medical)}円</p>
              <p>支援金分: {formatNumber(results.healthInsurance.support)}円</p>
              <p>介護分: {formatNumber(results.healthInsurance.nursing)}円</p>
              {results.details.reductionType !== 'なし' && (
                <p className="font-semibold text-red-600">軽減措置: {results.details.reductionType}が適用</p>
              )}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded">
            <h4 className="font-semibold mb-2">3. 世帯構成</h4>
            <p>国保被保険者数: {results.details.familyMembers}人</p>
            <p>介護保険対象者（40-64歳）: {results.details.nursingMembers}人</p>
            <p>国民年金支払い人数: {results.pension.count + results.spousePension.count + results.childrenPension.count}人</p>
          </div>
        </div>
      </div>
    )}
  </div>
);

// メインコンポーネント
function SocialInsuranceCalculator() {
  // 基本情報ステート
  const [income, setIncome] = useState('300');
  const [doTaxReturn, setDoTaxReturn] = useState(false);
  const [taxReturnType, setTaxReturnType] = useState('blue-65');
  const [age, setAge] = useState('40');
  
  // 家族構成ステート
  const [spouse, setSpouse] = useState(false);
  const [spouseAge, setSpouseAge] = useState('40');
  const [spouseIncome, setSpouseIncome] = useState('0');
  const [childrenOver20InDependentRange, setChildrenOver20InDependentRange] = useState('0');
  
  // 扶養関連ステート
  const [canProvideDependency, setCanProvideDependency] = useState(false);
  const [dependentParentsCount, setDependentParentsCount] = useState('0');
  const [dependentOthersCount, setDependentOthersCount] = useState('0');
  const [dependentParents, setDependentParents] = useState([]);
  const [dependentOthers, setDependentOthers] = useState([]);
  
  // 結果ステート
  const [results, setResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // 個人の保険料計算関数
  const calculatePersonInsurance = (age, incomeWan) => {
    const income = incomeWan;
    const incomeBase = Math.max(0, income - CONSTANTS.BASIC_DEDUCTION);
    
    let healthInsurance = Math.floor(incomeBase * 0.1074) + 91500;
    
    if (age >= 40 && age < 65) {
      healthInsurance += Math.floor(incomeBase * CONSTANTS.TOKYO_RATES.nursing.incomeRate) + CONSTANTS.TOKYO_RATES.nursing.capita;
    }
    
    let reduction = 1;
    if (income <= CONSTANTS.BASIC_DEDUCTION_RESIDENT) {
      reduction = 0.3;
    } else if (income <= CONSTANTS.BASIC_DEDUCTION_RESIDENT + 295000) {
      reduction = 0.5;
    } else if (income <= CONSTANTS.BASIC_DEDUCTION_RESIDENT + 545000) {
      reduction = 0.8;
    }
    
    healthInsurance *= reduction;
    
    const pension = (age >= 20 && age < 60) ? CONSTANTS.PENSION_MONTHLY * 12 : 0;
    const kaigo65Over = (age >= 65) ? CONSTANTS.KAIGO_65_OVER_YEARLY : 0;
    
    return Math.floor(healthInsurance + pension + kaigo65Over);
  };

  // メイン計算関数
  const calculateInsurance = () => {
    // 入力値検証
    if (!income || parseFloat(income) <= 0) {
      alert('年間所得を正しく入力してください');
      return;
    }
    
    try {
      const numIncome = parseFloat(income) * 10000;
      const userAge = parseInt(age);
      const userSpouseAge = parseInt(spouseAge);
      
      let taxableIncome = numIncome;
      
      // 計算詳細の初期化
      const calcDetails = {
        originalIncome: numIncome,
        taxReturnDeduction: 0,
        taxReturnType: taxReturnType,
        basicDeduction: CONSTANTS.BASIC_DEDUCTION,
        incomeBase: 0,
        reduction: 1,
        reductionType: 'なし'
      };
      
      // 確定申告による控除
      if (doTaxReturn) {
        calcDetails.taxReturnDeduction = calculateTaxDeduction(taxReturnType);
        taxableIncome = Math.max(0, taxableIncome - calcDetails.taxReturnDeduction);
      }
      
      // 基礎控除
      const incomeBase = Math.max(0, taxableIncome - calcDetails.basicDeduction);
      calcDetails.incomeBase = incomeBase;
      
      // 世帯の人数計算
      let familyMembers = 1;
      let nursingMembers = 0;
      
      if (userAge >= 40 && userAge < 65) {
        nursingMembers++;
      }
      
      if (spouse) {
        familyMembers++;
        if (userSpouseAge >= 40 && userSpouseAge < 65) {
          nursingMembers++;
        }
      }
      
      const childrenOver20Count = parseInt(childrenOver20InDependentRange) || 0;
      familyMembers += childrenOver20Count;
      
      // 国民健康保険料計算
      const medicalIncome = Math.floor(incomeBase * CONSTANTS.TOKYO_RATES.medical.incomeRate);
      const medicalCapita = CONSTANTS.TOKYO_RATES.medical.capita * familyMembers;
      let medicalTotal = Math.min(medicalIncome + medicalCapita, CONSTANTS.TOKYO_RATES.medical.maxAmount);
      
      const supportIncome = Math.floor(incomeBase * CONSTANTS.TOKYO_RATES.support.incomeRate);
      const supportCapita = CONSTANTS.TOKYO_RATES.support.capita * familyMembers;
      let supportTotal = Math.min(supportIncome + supportCapita, CONSTANTS.TOKYO_RATES.support.maxAmount);
      
      let nursingIncome = 0;
      let nursingCapita = 0;
      let nursingTotal = 0;
      if (nursingMembers > 0) {
        nursingIncome = Math.floor(incomeBase * CONSTANTS.TOKYO_RATES.nursing.incomeRate);
        nursingCapita = CONSTANTS.TOKYO_RATES.nursing.capita * nursingMembers;
        nursingTotal = Math.min(nursingIncome + nursingCapita, CONSTANTS.TOKYO_RATES.nursing.maxAmount);
      }
      
      // 軽減措置判定
      let totalIncomeForReduction = taxableIncome;
      
      if (spouse && parseFloat(spouseIncome) > 0) {
        // 配偶者の所得控除後金額を計算して加算
        const spouseIncomeYen = parseFloat(spouseIncome) * 10000;
        let spouseIncomeAfterDeduction = 0;
        
        if (spouseIncomeYen <= 550000) {
          spouseIncomeAfterDeduction = 0;
        } else if (spouseIncomeYen <= 1619000) {
          spouseIncomeAfterDeduction = spouseIncomeYen - 550000;
        } else if (spouseIncomeYen <= 1800000) {
          spouseIncomeAfterDeduction = Math.floor(spouseIncomeYen * 0.6 + 100000);
        } else if (spouseIncomeYen <= 3600000) {
          spouseIncomeAfterDeduction = Math.floor(spouseIncomeYen * 0.7 - 80000);
        } else if (spouseIncomeYen <= 6600000) {
          spouseIncomeAfterDeduction = Math.floor(spouseIncomeYen * 0.8 - 440000);
        } else if (spouseIncomeYen <= 8500000) {
          spouseIncomeAfterDeduction = Math.floor(spouseIncomeYen * 0.9 - 1100000);
        } else {
          spouseIncomeAfterDeduction = spouseIncomeYen - 1950000;
        }
        totalIncomeForReduction += spouseIncomeAfterDeduction;
      }
      
      // 軽減判定
      if (totalIncomeForReduction <= CONSTANTS.BASIC_DEDUCTION_RESIDENT) {
        calcDetails.reduction = 0.3;
        calcDetails.reductionType = '7割軽減';
      } else if (totalIncomeForReduction <= CONSTANTS.BASIC_DEDUCTION_RESIDENT + 295000 * familyMembers) {
        calcDetails.reduction = 0.5;
        calcDetails.reductionType = '5割軽減';
      } else if (totalIncomeForReduction <= CONSTANTS.BASIC_DEDUCTION_RESIDENT + 545000 * familyMembers) {
        calcDetails.reduction = 0.8;
        calcDetails.reductionType = '2割軽減';
      }
      
      // 軽減適用
      medicalTotal *= calcDetails.reduction;
      supportTotal *= calcDetails.reduction;
      nursingTotal *= calcDetails.reduction;
      
      let healthInsuranceYearly = Math.floor(medicalTotal + supportTotal + nursingTotal);
      healthInsuranceYearly = Math.min(healthInsuranceYearly, CONSTANTS.TOKYO_RATES.totalMaxAmount);
      
      // 個人別保険料計算
      const calculatePersonalInsurance = (personAge, personIncome, isMainPerson = false) => {
        let personIncomeBase = 0;
        
        if (isMainPerson) {
          personIncomeBase = incomeBase;
        } else {
          if (personIncome > 0) {
            const personIncomeYen = personIncome * 10000;
            // 給与所得控除等の計算
            if (personIncomeYen <= 550000) {
              personIncomeBase = 0;
            } else if (personIncomeYen <= 1619000) {
              personIncomeBase = personIncomeYen - 550000;
            } else if (personIncomeYen <= 1800000) {
              personIncomeBase = Math.floor(personIncomeYen * 0.6 + 100000);
            } else if (personIncomeYen <= 3600000) {
              personIncomeBase = Math.floor(personIncomeYen * 0.7 - 80000);
            } else if (personIncomeYen <= 6600000) {
              personIncomeBase = Math.floor(personIncomeYen * 0.8 - 440000);
            } else if (personIncomeYen <= 8500000) {
              personIncomeBase = Math.floor(personIncomeYen * 0.9 - 1100000);
            } else {
              personIncomeBase = personIncomeYen - 1950000;
            }
            personIncomeBase = Math.max(0, personIncomeBase - CONSTANTS.BASIC_DEDUCTION);
          }
        }
        
        const personalMedical = Math.floor(personIncomeBase * CONSTANTS.TOKYO_RATES.medical.incomeRate) + CONSTANTS.TOKYO_RATES.medical.capita;
        const personalSupport = Math.floor(personIncomeBase * CONSTANTS.TOKYO_RATES.support.incomeRate) + CONSTANTS.TOKYO_RATES.support.capita;
        let personalNursing = 0;
        if (personAge >= 40 && personAge < 65) {
          personalNursing = Math.floor(personIncomeBase * CONSTANTS.TOKYO_RATES.nursing.incomeRate) + CONSTANTS.TOKYO_RATES.nursing.capita;
        }
        
        return {
          medical: Math.floor(personalMedical * calcDetails.reduction),
          support: Math.floor(personalSupport * calcDetails.reduction),
          nursing: Math.floor(personalNursing * calcDetails.reduction),
          total: Math.floor((personalMedical + personalSupport + personalNursing) * calcDetails.reduction),
          incomeBase: personIncomeBase
        };
      };
      
      // 個人別保険料計算結果
      const individualInsurance = {
        self: calculatePersonalInsurance(userAge, parseFloat(income), true),
        spouse: spouse ? calculatePersonalInsurance(userSpouseAge, parseFloat(spouseIncome)) : null,
        children: []
      };
      
      // 20歳以上の子どもの保険料
      for (let i = 0; i < childrenOver20Count; i++) {
        const childInsurance = {
          medical: Math.floor(CONSTANTS.TOKYO_RATES.medical.capita * calcDetails.reduction),
          support: Math.floor(CONSTANTS.TOKYO_RATES.support.capita * calcDetails.reduction),
          nursing: 0,
          total: Math.floor((CONSTANTS.TOKYO_RATES.medical.capita + CONSTANTS.TOKYO_RATES.support.capita) * calcDetails.reduction),
          incomeBase: 0
        };
        individualInsurance.children.push(childInsurance);
      }
      
      // 国民年金計算
      const pensionYearly = (userAge >= 20 && userAge < 60) ? CONSTANTS.PENSION_MONTHLY * 12 : 0;
      const spousePensionYearly = (spouse && userSpouseAge >= 20 && userSpouseAge < 60) ? CONSTANTS.PENSION_MONTHLY * 12 : 0;
      const childrenPensionYearly = childrenOver20Count * CONSTANTS.PENSION_MONTHLY * 12;
      
      // 65歳以上の介護保険料
      const selfKaigo65Over = (userAge >= 65) ? CONSTANTS.KAIGO_65_OVER_YEARLY : 0;
      const spouseKaigo65Over = (spouse && userSpouseAge >= 65) ? CONSTANTS.KAIGO_65_OVER_YEARLY : 0;
      
      // 扶養予定同居人の節約額計算
      let dependentSavings = 0;
      let dependentDetails = [];
      
      if (canProvideDependency) {
        for (let i = 0; i < dependentParents.length; i++) {
          const parent = dependentParents[i];
          const parentAge = parseInt(parent.age) || 70;
          const parentIncome = (parseFloat(parent.income) || 80) * 10000;
          
          if (parentAge >= 75) continue;
          
          const parentInsurance = calculatePersonInsurance(parentAge, parentIncome);
          dependentSavings += parentInsurance;
          dependentDetails.push({
            type: '親',
            age: parentAge,
            income: parent.income,
            total: parentInsurance
          });
        }
        
        for (let i = 0; i < dependentOthers.length; i++) {
          const other = dependentOthers[i];
          const otherAge = parseInt(other.age) || 30;
          const otherIncome = (parseFloat(other.income) || 80) * 10000;
          
          if (otherAge >= 75) continue;
          
          const otherInsurance = calculatePersonInsurance(otherAge, otherIncome);
          dependentSavings += otherInsurance;
          dependentDetails.push({
            type: 'その他家族',
            age: otherAge,
            income: other.income,
            total: otherInsurance
          });
        }
      }
      
      // 現在の保険料合計
      const currentFamilyYearly = healthInsuranceYearly + pensionYearly + spousePensionYearly + childrenPensionYearly + selfKaigo65Over + spouseKaigo65Over;
      const currentTotalYearly = canProvideDependency && dependentSavings > 0 
        ? currentFamilyYearly + dependentSavings 
        : currentFamilyYearly;
      const currentTotalMonthly = Math.floor(currentTotalYearly / 12);
      
      // 事業主共生連料金
      const hasFamily = spouse || childrenOver20Count > 0;
      const jigyonushiMonthly = hasFamily ? CONSTANTS.JIGYONUSHI.FAMILY : CONSTANTS.JIGYONUSHI.SINGLE;
      const jigyonushiYearly = jigyonushiMonthly * 12;
      
      // 差額計算
      const differenceMonthly = currentTotalMonthly - jigyonushiMonthly;
      const differenceYearly = currentTotalYearly - jigyonushiYearly;
      
      // 結果設定
      setResults({
        healthInsurance: {
          yearly: healthInsuranceYearly,
          monthly: Math.floor(healthInsuranceYearly / 12),
          medical: Math.floor(medicalTotal),
          support: Math.floor(supportTotal),
          nursing: Math.floor(nursingTotal),
          individual: individualInsurance
        },
        pension: {
          yearly: pensionYearly,
          monthly: pensionYearly > 0 ? CONSTANTS.PENSION_MONTHLY : 0,
          count: pensionYearly > 0 ? 1 : 0
        },
        spousePension: {
          yearly: spousePensionYearly,
          monthly: spousePensionYearly > 0 ? CONSTANTS.PENSION_MONTHLY : 0,
          count: spousePensionYearly > 0 ? 1 : 0
        },
        childrenPension: {
          yearly: childrenPensionYearly,
          monthly: childrenOver20Count * CONSTANTS.PENSION_MONTHLY,
          count: childrenOver20Count
        },
        kaigo65Over: {
          self: selfKaigo65Over,
          spouse: spouseKaigo65Over,
          total: selfKaigo65Over + spouseKaigo65Over
        },
        total: {
          yearly: currentTotalYearly,
          monthly: currentTotalMonthly,
          familyOnlyYearly: currentFamilyYearly,
          familyOnlyMonthly: Math.floor(currentFamilyYearly / 12)
        },
        comparison: {
          hasFamily,
          jigyonushiMonthly,
          jigyonushiYearly,
          differenceMonthly,
          differenceYearly,
          isJigyonushiBetter: differenceMonthly > 0
        },
        provideDependency: {
          checked: canProvideDependency,
          totalSavings: dependentSavings,
          monthlySavings: Math.floor(dependentSavings / 12),
          details: dependentDetails
        },
        details: {
          ...calcDetails,
          familyMembers,
          nursingMembers,
          childrenOver20Count,
          userAge,
          userSpouseAge
        }
      });
      
    } catch (error) {
      console.error('計算エラー:', error);
      alert('計算中にエラーが発生しました: ' + error.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <i data-lucide="calculator" className="w-8 h-8 text-blue-600 mr-3"></i>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">個人事業主向け社会保険料計算ツール【2025年度版】</h1>
            <p className="text-sm text-gray-600 mt-1">東京都葛飾区の料率基準 | 事業主共生連サービスとの料金比較で最適な選択を</p>
          </div>
        </div>
        
        {/* サービス紹介バナー */}
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3">🎯 事業主共生連の月額定額サービス</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-lg">独身の方：月額 {formatNumber(CONSTANTS.JIGYONUSHI.SINGLE)}円</p>
              <p className="font-semibold text-lg">家族プラン：月額 {formatNumber(CONSTANTS.JIGYONUSHI.FAMILY)}円</p>
            </div>
            <div className="space-y-1">
              <p>✓ 社会保険・厚生年金に加入</p>
              <p>✓ <strong>介護保険料（40-64歳）も込み</strong></p>
              <p>✓ 家族を扶養に入れて保険料節約</p>
              <p>✓ 親や同居家族も扶養可能</p>
            </div>
          </div>
          <p className="text-xs mt-3 opacity-90">
            現在の保険料と比較して、どちらがお得か計算してみましょう！扶養予定の家族がいる場合は、その家族の現在の保険料も含めて正確に比較します。
          </p>
        </div>
        
        {/* 入力フォーム */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <BasicInfoForm
            income={income} setIncome={setIncome}
            age={age} setAge={setAge}
            doTaxReturn={doTaxReturn} setDoTaxReturn={setDoTaxReturn}
            taxReturnType={taxReturnType} setTaxReturnType={setTaxReturnType}
            spouse={spouse} setSpouse={setSpouse}
            spouseAge={spouseAge} setSpouseAge={setSpouseAge}
            spouseIncome={spouseIncome} setSpouseIncome={setSpouseIncome}
            childrenOver20InDependentRange={childrenOver20InDependentRange}
            setChildrenOver20InDependentRange={setChildrenOver20InDependentRange}
            canProvideDependency={canProvideDependency}
            setCanProvideDependency={setCanProvideDependency}
          />
          
          <DependentForm
            canProvideDependency={canProvideDependency}
            dependentParentsCount={dependentParentsCount}
            setDependentParentsCount={setDependentParentsCount}
            dependentOthersCount={dependentOthersCount}
            setDependentOthersCount={setDependentOthersCount}
            dependentParents={dependentParents}
            setDependentParents={setDependentParents}
            dependentOthers={dependentOthers}
            setDependentOthers={setDependentOthers}
          />
        </div>
        
        {/* 計算ボタン */}
        <button
          onClick={calculateInsurance}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 text-lg"
        >
          保険料を計算する
        </button>

        {/* 75歳以上の警告 */}
        {results && results.details.userAge >= 75 && (
          <div className="mt-4 bg-red-50 border-2 border-red-400 p-4 rounded">
            <p className="text-red-800 font-semibold">
              <i data-lucide="alert-circle" className="inline w-5 h-5 mr-2"></i>
              75歳以上の方は後期高齢者医療制度の対象となるため、国民健康保険の計算対象外です。
              後期高齢者医療制度の保険料については、お住まいの市区町村にお問い合わせください。
            </p>
          </div>
        )}
        
        {/* 計算結果 */}
        {results && (
          <div className="mt-8">
            {/* 印刷ボタン */}
            <div className="mb-6 flex flex-wrap gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
              >
                <i data-lucide="printer" className="w-4 h-4 mr-2"></i>
                結果をPDFで保存
              </button>
            </div>

            {/* 結果表示 */}
            <ResultsDisplay 
              results={results} 
              income={income} 
              spouse={spouse} 
              spouseIncome={spouseIncome}
              showDetails={showDetails}
              setShowDetails={setShowDetails}
            />
            
            {/* 個別相談CTA（計算結果後） */}
            <CTASection
              title="計算結果を確認できましたか？"
              subtitle="次のステップに進むために、専門家と一緒に最適なプランを決めませんか？"
              benefits={[
                "✓ あなたの計算結果をもとに詳しく解説",
                "✓ 手続きの流れと必要書類をご案内",
                "✓ 将来のライフプランも含めてアドバイス",
                "✓ 今だけ限定の特別サポート"
              ]}
              buttonText="無料個別相談で詳しく聞く"
              bgColor="bg-gradient-to-r from-green-500 to-teal-500"
              isResults={true}
              results={results}
            />
            
            {/* 計算式の詳細 */}
            <CalculationDetails 
              results={results} 
              showDetails={showDetails} 
              setShowDetails={setShowDetails} 
            />
            
            {/* 最終CTA */}
            <CTASection
              title="今すぐ行動して、保険料を最適化しませんか？"
              subtitle="計算ツールで概算がわかったら、次は専門家と一緒に具体的なアクションプランを立てましょう"
              benefits={[
                "🎁 期間限定：無料個別相談＋手続きサポート",
                "📊 あなたの計算結果をもとにしたカスタマイズ提案",
                "📋 面倒な手続きもステップバイステップでサポート",
                "💰 年間数十万円の節約につながる可能性"
              ]}
              buttonText="今すぐ無料個別相談に参加する"
              bgColor="bg-gradient-to-r from-blue-600 to-indigo-600"
            />
            
            {/* 注意事項 */}
            <div className="mt-4 flex items-start bg-yellow-50 p-4 rounded">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">重要な注意事項：</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>この計算結果は2025年度の東京都の料率に基づく概算です</li>
                  <li>実際の保険料は前年の所得や各種控除によって変動します</li>
                  <li>事業主共生連サービスは介護保険料（40-64歳）も月額料金に含まれています</li>
                  <li>正確な金額は、お住まいの区市町村にお問い合わせください</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SocialInsuranceCalculator;