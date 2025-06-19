import React, { useState } from 'react';
import { Calculator, Users, FileText, AlertCircle, Info, ChevronDown, ChevronUp, CheckCircle, XCircle, ExternalLink, Printer } from 'lucide-react';

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
      <ExternalLink className="ml-2 w-5 h-5" />
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
        <FileText className="w-5 h-5 mr-2 text-blue-600" />
        基本情報・家族構成
      </h2>
      {/* ... ここから下は省略。次の編集で追記 ... */}
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

// DependentForm
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
        <Users className="w-5 h-5 mr-2 text-blue-600" />
        扶養予定同居人
      </h2>
      {/* ... ここから下は省略。次の編集で追記 ... */}
    </div>
  );
};

// PersonalInsuranceTable
// ... ここにPersonalInsuranceTableの内容を追記 ...

// ResultsDisplay
// ... ここにResultsDisplayの内容を追記 ...

// CalculationDetails
// ... ここにCalculationDetailsの内容を追記 ...

// SocialInsuranceCalculator本体
// ... ここにSocialInsuranceCalculator関数本体を追記 ...

export default SocialInsuranceCalculator; 