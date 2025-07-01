import React, { useState, useEffect } from 'react';
import { Calculator, Users, FileText, AlertCircle, Info, ChevronDown, ChevronUp, CheckCircle, XCircle, ExternalLink, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 定数定義（2025年度最新データ）
const CONSTANTS = {
  PENSION_MONTHLY: 17510, // 2025年度国民年金保険料（月額）
  KAIGO_65_OVER_YEARLY: 74700, // 65歳以上介護保険料（2024-26年度全国平均）
  BASIC_DEDUCTION: 480000, // 基礎控除額（所得税ベース）
  BASIC_DEDUCTION_RESIDENT: 430000, // 基礎控除額（住民税ベース・軽減判定用）
  // 東京都葛飾区の料率（2024年度データ・2025年度は未発表）
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
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`my-8 ${bgColor} rounded-xl p-6 text-white shadow-lg hover:shadow-2xl transition-shadow duration-300`}
  >
    <div className="flex items-start mb-5">
      <motion.div 
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, delay: 1 }}
        className="text-3xl mr-4"
      >
        💡
      </motion.div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm opacity-90 mb-4">{subtitle}</p>
        {isResults && results && results.comparison.isJigyonushiBetter && (
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-white bg-opacity-20 p-3 rounded-lg mb-4 font-semibold text-center"
          >
            🎉 事業主共生連で月額{Math.abs(results.comparison.differenceMonthly).toLocaleString()}円の節約が可能です！
          </motion.div>
        )}
        <ul className="text-sm space-y-2">
          {benefits.map((benefit, index) => (
            <motion.li 
              key={index} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 0.95, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {benefit}
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
    <motion.a 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      href="https://lin.ee/GCnNh3B" 
      target="_blank" 
      rel="noopener noreferrer"
      className="btn btn-secondary w-full text-lg font-bold bg-white hover:bg-white border-0 shadow-lg"
    >
      <span>{buttonText}</span>
      <ExternalLink className="ml-2 w-5 h-5" />
    </motion.a>
  </motion.div>
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 p-6 rounded-lg"
    >
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-blue-600" />
        基本情報・家族構成
      </h2>
      
      <div className="space-y-4">
        {/* 年間所得 */}
        <motion.div whileHover={{ scale: 1.01 }}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            年間所得（万円）
          </label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
          <div className="mt-1 flex items-start">
            <Info className="w-4 h-4 text-gray-500 mr-1 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-600">
              <p>売上（収入）から必要経費を差し引いた金額です。</p>
              <p className="mt-1">確定申告書では「所得金額」の欄に記載される金額を入力してください。</p>
              <p className="mt-1">例：売上500万円－経費200万円＝所得300万円</p>
            </div>
          </div>
        </motion.div>
        
        {/* 年齢 */}
        <motion.div whileHover={{ scale: 1.01 }}>
          <label className="block text-sm font-medium text-gray-700 mb-1">年齢</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </motion.div>
        
        {/* 確定申告 */}
        <motion.div whileHover={{ scale: 1.01 }}>
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
          <AnimatePresence>
            {doTaxReturn && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">申告の種類</label>
                <select
                  value={taxReturnType}
                  onChange={(e) => setTaxReturnType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="blue-65">青色申告（65万円控除）</option>
                  <option value="blue-55">青色申告（55万円控除）</option>
                  <option value="blue-10">青色申告（10万円控除）</option>
                  <option value="white">白色申告</option>
                </select>
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                  <p><strong>青色申告（65万円控除）</strong>：複式簿記で記帳し、e-Taxで申告する場合</p>
                  <p><strong>青色申告（55万円控除）</strong>：複式簿記で記帳し、紙で申告する場合</p>
                  <p><strong>青色申告（10万円控除）</strong>：簡易簿記で記帳している場合</p>
                  <p><strong>白色申告</strong>：青色申告の承認を受けていない場合（特別控除なし）</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* 配偶者 */}
        <motion.div whileHover={{ scale: 1.01 }} className="border-t pt-4">
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
          <AnimatePresence>
            {spouse && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-3"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">配偶者の年齢</label>
                  <input
                    type="number"
                    value={spouseAge}
                    onChange={(e) => setSpouseAge(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    placeholder="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    パート収入、個人事業収入など、配偶者の全ての収入の合計を入力してください。収入がない場合は0を入力。
                  </p>
                  {spouseRangeInfo && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-xs mt-1 ${spouseRangeInfo.isInRange ? 'text-green-600' : 'text-gray-600'}`}
                    >
                      {spouseRangeInfo.message}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* 20歳以上の子ども */}
        <motion.div whileHover={{ scale: 1.01 }}>
          <label className="block text-sm font-medium text-gray-700 mb-1">20歳以上の子どもの人数</label>
          <input
            type="number"
            value={childrenOver20InDependentRange}
            onChange={(e) => setChildrenOver20InDependentRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            placeholder="0"
            min="0"
          />
          <div className="mt-1 flex items-start">
            <Info className="w-4 h-4 text-gray-500 mr-1 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-600">
              <p>20歳以上の子どもの人数です。国民健康保険には扶養制度がないため、収入に関わらず全員が被保険者となります。</p>
              <p className="mt-1">例：大学生、無職の成人した子どもなど</p>
              <p className="mt-1">20歳以上60歳未満の子どもは国民年金の支払い対象となります。</p>
            </div>
          </div>
        </motion.div>
        
        {/* 扶養予定同居人チェック */}
        <motion.div whileHover={{ scale: 1.01 }} className="border-t pt-4">
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
        </motion.div>
      </div>
    </motion.div>
  );
};

// 扶養予定同居人入力コンポーネント
const DependentPersonInput = ({ person, index, type, onChange }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    className="card p-4"
  >
    <p className="text-sm font-medium text-neutral-700 mb-2">
      {type}{index + 1}人目の情報
    </p>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="input-label text-xs">年齢</label>
        <input
          type="number"
          value={person.age}
          onChange={(e) => onChange(index, 'age', e.target.value)}
          className="input-field py-2 text-sm"
          min={type === '親' ? "60" : "0"}
          max="74"
        />
        {type === '親' && <p className="input-helper">75歳以上は後期高齢者医療制度</p>}
      </div>
      <div>
        <label className="input-label text-xs">年収（万円）</label>
        <input
          type="number"
          value={person.income}
          onChange={(e) => onChange(index, 'income', e.target.value)}
          className="input-field py-2 text-sm"
          min="0"
          max={type === '親' ? "180" : "130"}
        />
      </div>
    </div>
  </motion.div>
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 p-6 rounded-lg"
    >
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2 text-blue-600" />
        扶養予定同居人
      </h2>
      
      {canProvideDependency ? (
        <div className="space-y-4">
          {/* 親の人数入力 */}
          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block text-sm text-gray-700 mb-1">
              扶養に入れる親（60歳以上）の人数
            </label>
            <input
              type="number"
              value={dependentParentsCount}
              onChange={(e) => updateDependentParents(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              placeholder="0"
              min="0"
              max="4"
            />
            <p className="text-xs text-gray-500 mt-1">
              年収180万円未満で同居または仕送りをしている親の人数
            </p>
          </motion.div>
          
          {/* 親の詳細情報 */}
          <AnimatePresence>
            {dependentParents.map((parent, index) => (
              <DependentPersonInput
                key={`parent-${index}`}
                person={parent}
                index={index}
                type="親"
                onChange={handleParentChange}
              />
            ))}
          </AnimatePresence>
          
          {/* その他同居人の人数入力 */}
          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block text-sm text-gray-700 mb-1">
              扶養に入れるその他の同居人の人数
            </label>
            <input
              type="number"
              value={dependentOthersCount}
              onChange={(e) => updateDependentOthers(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              placeholder="0"
              min="0"
              max="10"
            />
            <p className="text-xs text-gray-500 mt-1">
              年収130万円未満で同居している同居人（兄弟姉妹、祖父母など）の人数
            </p>
          </motion.div>
          
          {/* その他同居人の詳細情報 */}
          <AnimatePresence>
            {dependentOthers.map((other, index) => (
              <DependentPersonInput
                key={`other-${index}`}
                person={other}
                index={index}
                type="その他同居人"
                onChange={handleOtherChange}
              />
            ))}
          </AnimatePresence>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card bg-yellow-50 p-4"
          >
            <p className="text-xs text-yellow-700">
              <Info className="inline w-4 h-4 mr-1" />
              扶養に入れる同居人の概算保険料を平均値で計算します。実際の保険料は各人の年齢・所得により異なります。
            </p>
          </motion.div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-neutral-500"
        >
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50 text-neutral-400" />
          <p className="text-sm">左側の「その他同居人を扶養に入れる場合の節約額を計算」にチェックを入れると、扶養予定同居人の情報を入力できます。</p>
        </motion.div>
      )}
    </motion.div>
  );
};

// 個人別保険料詳細テーブルコンポーネント
const PersonalInsuranceTable = ({ results, income, spouse, spouseIncome }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="mb-6 bg-white p-6 rounded shadow"
  >
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
          <tr>
            <td>
              <div className="font-medium">本人（{results.details.userAge}歳）</div>
              <div className="text-xs text-gray-500">年収{income}万円</div>
            </td>
            <td className="text-right">
              <div className="space-y-1">
                <div className="text-xs">医療: {formatNumber(Math.floor(results.healthInsurance.individual.self.medical/12))}円</div>
                <div className="text-xs">支援: {formatNumber(Math.floor(results.healthInsurance.individual.self.support/12))}円</div>
                {results.healthInsurance.individual.self.nursing > 0 && (
                  <div className="text-xs">介護: {formatNumber(Math.floor(results.healthInsurance.individual.self.nursing/12))}円</div>
                )}
                <div className="font-semibold pt-1 border-t">{formatNumber(Math.floor(results.healthInsurance.individual.self.total/12))}円</div>
              </div>
            </td>
            <td className="text-right">
              <div className="font-semibold">
                {results.pension.monthly > 0 ? `${formatNumber(CONSTANTS.PENSION_MONTHLY)}円` : '0円'}
              </div>
              {results.details.userAge < 20 && <div className="text-xs text-gray-500">20歳未満</div>}
              {results.details.userAge >= 60 && <div className="text-xs text-gray-500">60歳以上</div>}
            </td>
            <td className="text-right">
              {results.kaigo65Over.self > 0 ? (
                <div className="font-semibold">{formatNumber(Math.floor(results.kaigo65Over.self/12))}円</div>
              ) : (
                <div className="text-neutral-400">-</div>
              )}
            </td>
            <td className="text-right">
              <div className="text-lg font-bold text-primary-600">
                {formatNumber(Math.floor(results.healthInsurance.individual.self.total/12) + results.pension.monthly + Math.floor(results.kaigo65Over.self/12))}円
              </div>
            </td>
          </tr>
          
          {/* 配偶者 */}
          {spouse && results.healthInsurance.individual.spouse && (
            <tr>
              <td>
                <div className="font-medium">配偶者（{results.details.userSpouseAge}歳）</div>
                <div className="text-xs text-neutral-500">年収{spouseIncome}万円</div>
              </td>
              <td className="text-right">
                <div className="space-y-1">
                  <div className="text-xs">医療: {formatNumber(Math.floor(results.healthInsurance.individual.spouse.medical/12))}円</div>
                  <div className="text-xs">支援: {formatNumber(Math.floor(results.healthInsurance.individual.spouse.support/12))}円</div>
                  {results.healthInsurance.individual.spouse.nursing > 0 && (
                    <div className="text-xs">介護: {formatNumber(Math.floor(results.healthInsurance.individual.spouse.nursing/12))}円</div>
                  )}
                  <div className="font-semibold pt-1 border-t">{formatNumber(Math.floor(results.healthInsurance.individual.spouse.total/12))}円</div>
                </div>
              </td>
              <td className="text-right">
                <div className="font-semibold">
                  {results.spousePension.monthly > 0 ? `${formatNumber(CONSTANTS.PENSION_MONTHLY)}円` : '0円'}
                </div>
                {results.details.userSpouseAge < 20 && <div className="text-xs text-gray-500">20歳未満</div>}
                {results.details.userSpouseAge >= 60 && <div className="text-xs text-gray-500">60歳以上</div>}
              </td>
              <td className="text-right">
                {results.kaigo65Over.spouse > 0 ? (
                  <div className="font-semibold">{formatNumber(Math.floor(results.kaigo65Over.spouse/12))}円</div>
                ) : (
                  <div className="text-neutral-400">-</div>
                )}
              </td>
              <td className="text-right">
                <div className="text-lg font-bold text-primary-600">
                  {formatNumber(Math.floor(results.healthInsurance.individual.spouse.total/12) + results.spousePension.monthly + Math.floor(results.kaigo65Over.spouse/12))}円
                </div>
              </td>
            </tr>
          )}
          
          {/* 20歳以上の子ども */}
          {results.healthInsurance.individual.children && results.healthInsurance.individual.children.map((child, index) => (
            <tr key={`child-${index}`}>
              <td>
                <div className="font-medium">
                  20歳以上の子ども{results.healthInsurance.individual.children.length > 1 ? ` ${index + 1}` : ''}
                </div>
                <div className="text-xs text-neutral-500">所得なしと仮定</div>
              </td>
              <td className="text-right">
                <div className="space-y-1">
                  <div className="text-xs">医療: {formatNumber(Math.floor(child.medical/12))}円</div>
                  <div className="text-xs">支援: {formatNumber(Math.floor(child.support/12))}円</div>
                  <div className="text-xs">介護: 0円</div>
                  <div className="font-semibold pt-1 border-t">{formatNumber(Math.floor(child.total/12))}円</div>
                </div>
              </td>
              <td className="text-right">
                <div className="font-semibold">{formatNumber(CONSTANTS.PENSION_MONTHLY)}円</div>
              </td>
              <td className="text-right">
                <div className="text-neutral-400">-</div>
              </td>
              <td className="text-right">
                <div className="text-lg font-bold text-primary-600">
                  {formatNumber(Math.floor(child.total/12) + CONSTANTS.PENSION_MONTHLY)}円
                </div>
              </td>
            </tr>
          ))}
          
          {/* 扶養予定同居人 */}
          {results.provideDependency.checked && results.provideDependency.details && results.provideDependency.details.map((member, index) => (
            <tr key={`dependent-${index}`} className="bg-yellow-50">
              <td>
                <div className="font-medium">{member.type}（{member.age}歳）</div>
                <div className="text-xs text-accent-600">年収{member.income}万円・現在各自加入</div>
              </td>
              <td className="text-right">
                <div className="font-semibold">{formatNumber(Math.floor((member.total - (member.age >= 20 && member.age < 60 ? CONSTANTS.PENSION_MONTHLY * 12 : 0) - (member.age >= 65 ? CONSTANTS.KAIGO_65_OVER_YEARLY : 0))/12))}円</div>
                <div className="text-xs text-neutral-500">概算</div>
              </td>
              <td className="text-right">
                <div className="font-semibold">
                  {member.age >= 20 && member.age < 60 ? `${formatNumber(CONSTANTS.PENSION_MONTHLY)}円` : '0円'}
                </div>
              </td>
              <td className="text-right">
                {member.age >= 65 ? (
                  <div className="font-semibold">{formatNumber(Math.floor(CONSTANTS.KAIGO_65_OVER_YEARLY/12))}円</div>
                ) : (
                  <div className="text-neutral-400">-</div>
                )}
              </td>
              <td className="text-right">
                <div className="text-lg font-bold text-accent-600">
                  {formatNumber(Math.floor(member.total/12))}円
                </div>
              </td>
            </tr>
          ))}
          
          {/* 合計行 */}
          <tr className="bg-neutral-100 font-bold">
            <td>世帯合計</td>
            <td className="text-right">{formatNumber(results.healthInsurance.monthly)}円</td>
            <td className="text-right">
              {formatNumber(results.pension.monthly + results.spousePension.monthly + results.childrenPension.monthly + 
                (results.provideDependency.checked ? 
                  results.provideDependency.details.filter(m => m.age >= 20 && m.age < 60).length * CONSTANTS.PENSION_MONTHLY : 0))}円
            </td>
            <td className="text-right">
              {formatNumber(Math.floor(results.kaigo65Over.total/12) + 
                (results.provideDependency.checked ? 
                  results.provideDependency.details.filter(m => m.age >= 65).length * Math.floor(CONSTANTS.KAIGO_65_OVER_YEARLY/12) : 0))}円
            </td>
            <td className="text-right">
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
  </motion.div>
);

// 結果表示メインコンポーネント
const ResultsDisplay = ({ results, income, spouse, spouseIncome, showDetails, setShowDetails }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="bg-blue-50 p-6 rounded-lg"
  >
    <h2 className="text-xl font-bold mb-6 text-gray-800">📊 計算結果</h2>
    
    {/* メイン判定結果 */}
    <motion.div 
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className={`mb-8 p-8 rounded-xl border-4 text-center ${
        results.comparison.isJigyonushiBetter 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400' 
          : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-400'
      }`}
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="flex justify-center mb-4"
      >
        {results.comparison.isJigyonushiBetter ? (
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        ) : (
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-white" />
          </div>
        )}
      </motion.div>
      
      {results.comparison.isJigyonushiBetter ? (
        <>
          <h3 className="text-3xl font-bold text-green-800 mb-4">
            🎉 事業主共生連の方がお得です！
          </h3>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold text-green-600 mb-4"
          >
            月額 {formatNumber(Math.abs(results.comparison.differenceMonthly))}円 節約
          </motion.div>
          <div className="text-2xl text-green-700 mb-6">
            年間で {formatNumber(Math.abs(results.comparison.differenceYearly))}円 の節約効果
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass p-4 rounded-xl"
          >
            <p className="text-lg font-semibold text-accent-800">
              事業主共生連に切り替えることで大幅な保険料削減が可能です
            </p>
            <p className="text-sm text-accent-700 mt-2">
              さらに厚生年金により将来の年金受給額も増加します
            </p>
          </motion.div>
        </>
      ) : (
        <>
          <h3 className="text-3xl font-bold text-red-800 mb-4">
            現在の保険料の方が安いです
          </h3>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-red-600 mb-4"
          >
            月額 {formatNumber(Math.abs(results.comparison.differenceMonthly))}円 の差額
          </motion.div>
          <div className="text-xl text-red-700 mb-6">
            年間で {formatNumber(Math.abs(results.comparison.differenceYearly))}円 の差額
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass p-4 rounded-xl"
          >
            <p className="text-lg font-semibold text-red-800">
              現在の保険料の方が経済的です
            </p>
            <p className="text-sm text-neutral-700 mt-2">
              ただし、将来の年金額や保障内容を考慮すると事業主共生連にもメリットがあります
            </p>
          </motion.div>
        </>
      )}
    </motion.div>
    
    {/* 現在の保険料内訳 */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-6 card"
    >
      <h3 className="font-semibold text-neutral-800 mb-3">現在の保険料内訳</h3>
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
          <p className="text-primary-600 font-bold">✓ {
            results.details.taxReturnType === 'blue-65' ? '青色申告（65万円控除）' :
            results.details.taxReturnType === 'blue-55' ? '青色申告（55万円控除）' :
            results.details.taxReturnType === 'blue-10' ? '青色申告（10万円控除）' :
            '白色申告'
          }が適用されています</p>
        )}
        {results.details.reductionType !== 'なし' && (
          <p className="text-accent-600 font-bold">✓ {results.details.reductionType}が適用されています</p>
        )}
      </div>
    </motion.div>
    
    {/* 個人別保険料詳細テーブル */}
    <PersonalInsuranceTable results={results} income={income} spouse={spouse} spouseIncome={spouseIncome} />
    
    {/* 比較表示 */}
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="result-card bg-danger bg-opacity-10 border-2 border-danger p-6 text-center"
      >
        <h3 className="font-semibold text-neutral-800 mb-2">現在の保険料</h3>
        <div className="text-2xl font-bold text-danger mb-2">月額: {formatNumber(results.total.monthly)}円</div>
        <div className="text-neutral-600">年額: {formatNumber(results.total.yearly)}円</div>
        <p className="text-sm mt-2">世帯{results.details.familyMembers}人分の保険料</p>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="result-card bg-accent-50 border-2 border-accent-400 p-6 text-center"
      >
        <h3 className="font-semibold text-neutral-800 mb-2">事業主共生連</h3>
        <div className="text-2xl font-bold text-accent-600 mb-2">月額: {formatNumber(results.comparison.jigyonushiMonthly)}円</div>
        <div className="text-neutral-600">年額: {formatNumber(results.comparison.jigyonushiYearly)}円</div>
        <p className="text-sm mt-2">{results.comparison.hasFamily ? '家族プラン' : '独身プラン'}（扶養可能）</p>
        <div className="mt-3 text-sm text-neutral-600">
          <p>• 社会保険・厚生年金込み</p>
          <p>• <strong className="text-primary-600">介護保険料（40-64歳）も含む</strong></p>
          <p>• 家族の扶養可能（保険料追加なし）</p>
          {results.provideDependency.checked && results.provideDependency.totalSavings > 0 && (
            <p className="text-primary-600 font-semibold">• 扶養で{results.provideDependency.details.length}人分の保険料が無料に！</p>
          )}
        </div>
      </motion.div>
    </div>
    
    {/* 扶養予定同居人の詳細 */}
    {results.provideDependency.checked && results.provideDependency.details.length > 0 && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6 card bg-accent-50"
      >
        <h4 className="font-semibold text-neutral-800 mb-2">扶養予定同居人の現在の保険料</h4>
        {results.provideDependency.details.map((member, index) => (
          <p key={index} className="text-sm">
            • {member.type}（{member.age}歳・年収{member.income}万円）: 年額 {formatNumber(member.total)}円
          </p>
        ))}
      </motion.div>
    )}
  </motion.div>
);

// 計算式詳細コンポーネント
const CalculationDetails = ({ results, showDetails, setShowDetails }) => (
  <div className="mt-6">
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setShowDetails(!showDetails)}
      className="flex items-center text-primary-600 hover:text-primary-800 font-medium transition-colors duration-200"
    >
      計算式の詳細を{showDetails ? '隠す' : '見る'}
      {showDetails ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />}
    </motion.button>
    
    <AnimatePresence>
      {showDetails && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 card bg-neutral-50 text-sm"
        >
          <h3 className="font-bold mb-3 text-lg">計算式の詳細</h3>
          
          <div className="space-y-4">
            <div className="card bg-white">
              <h4 className="font-semibold mb-2 text-neutral-900">1. 課税所得の計算</h4>
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
            
            <div className="card bg-white">
              <h4 className="font-semibold mb-2 text-neutral-900">2. 国民健康保険料の計算</h4>
              <div className="space-y-2">
                <p>医療分: {formatNumber(results.healthInsurance.medical)}円</p>
                <p>支援金分: {formatNumber(results.healthInsurance.support)}円</p>
                <p>介護分: {formatNumber(results.healthInsurance.nursing)}円</p>
                {results.details.reductionType !== 'なし' && (
                  <p className="font-semibold text-danger">軽減措置: {results.details.reductionType}が適用</p>
                )}
              </div>
            </div>
            
            <div className="card bg-white">
              <h4 className="font-semibold mb-2 text-neutral-900">3. 世帯構成</h4>
              <p>国保被保険者数: {results.details.familyMembers}人</p>
              <p>介護保険対象者（40-64歳）: {results.details.nursingMembers}人</p>
              <p>国民年金支払い人数: {results.pension.count + results.spousePension.count + results.childrenPension.count}人</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
  const [shouldScroll, setShouldScroll] = useState(false);

  // スクロール処理
  useEffect(() => {
    if (shouldScroll && results) {
      // 結果がDOMに反映されるまで待機
      const timer = setTimeout(() => {
        const element = document.getElementById('results-section');
        if (element) {
          // スクロール位置を計算（ヘッダーの高さを考慮）
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
        setShouldScroll(false);
      }, 500); // タイムアウトを500msに増やして、DOMの更新を確実に待つ
      
      return () => clearTimeout(timer);
    }
  }, [shouldScroll, results]);

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
      
      // 世帯全体の所得を計算（配偶者の所得も含む）
      let householdIncomeBase = incomeBase;
      
      if (spouse && parseFloat(spouseIncome) > 0) {
        const spouseIncomeYen = parseFloat(spouseIncome) * 10000;
        // 配偶者の所得金額を計算（基礎控除後）
        const spouseTaxableIncome = Math.max(0, spouseIncomeYen - CONSTANTS.BASIC_DEDUCTION);
        householdIncomeBase += spouseTaxableIncome;
      }
      
      // 国民健康保険料計算（世帯の合計所得を使用）
      const medicalIncome = Math.floor(householdIncomeBase * CONSTANTS.TOKYO_RATES.medical.incomeRate);
      const medicalCapita = CONSTANTS.TOKYO_RATES.medical.capita * familyMembers;
      let medicalTotal = Math.min(medicalIncome + medicalCapita, CONSTANTS.TOKYO_RATES.medical.maxAmount);
      
      const supportIncome = Math.floor(householdIncomeBase * CONSTANTS.TOKYO_RATES.support.incomeRate);
      const supportCapita = CONSTANTS.TOKYO_RATES.support.capita * familyMembers;
      let supportTotal = Math.min(supportIncome + supportCapita, CONSTANTS.TOKYO_RATES.support.maxAmount);
      
      let nursingIncome = 0;
      let nursingCapita = 0;
      let nursingTotal = 0;
      if (nursingMembers > 0) {
        nursingIncome = Math.floor(householdIncomeBase * CONSTANTS.TOKYO_RATES.nursing.incomeRate);
        nursingCapita = CONSTANTS.TOKYO_RATES.nursing.capita * nursingMembers;
        nursingTotal = Math.min(nursingIncome + nursingCapita, CONSTANTS.TOKYO_RATES.nursing.maxAmount);
      }
      
      // 軽減措置判定（世帯の合計所得で判定）
      let totalIncomeForReduction = taxableIncome;
      
      if (spouse && parseFloat(spouseIncome) > 0) {
        // 配偶者の所得を加算（軽減判定用）
        const spouseIncomeYen = parseFloat(spouseIncome) * 10000;
        totalIncomeForReduction += spouseIncomeYen;
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
      
      // 個人別保険料計算（表示用の概算）
      const calculatePersonalInsurance = (personAge, personIncome, isMainPerson = false) => {
        // 世帯全体の保険料を人数で按分する方法に変更
        const totalMembers = familyMembers;
        const hasIncome = isMainPerson || (personIncome > 0);
        
        // 所得割の按分（所得がある人だけで分割）
        let incomeRatio = 0;
        if (hasIncome) {
          if (isMainPerson && householdIncomeBase > 0) {
            incomeRatio = incomeBase / householdIncomeBase;
          } else if (!isMainPerson && personIncome > 0 && householdIncomeBase > 0) {
            const personIncomeYen = personIncome * 10000;
            const personTaxableIncome = Math.max(0, personIncomeYen - CONSTANTS.BASIC_DEDUCTION);
            incomeRatio = personTaxableIncome / householdIncomeBase;
          }
        }
        
        // 医療分の計算
        const personalMedicalIncome = Math.floor(medicalIncome * incomeRatio);
        const personalMedicalCapita = Math.floor(medicalCapita / totalMembers);
        const personalMedical = personalMedicalIncome + personalMedicalCapita;
        
        // 支援金分の計算
        const personalSupportIncome = Math.floor(supportIncome * incomeRatio);
        const personalSupportCapita = Math.floor(supportCapita / totalMembers);
        const personalSupport = personalSupportIncome + personalSupportCapita;
        
        // 介護分の計算（40-64歳のみ）
        let personalNursing = 0;
        if (personAge >= 40 && personAge < 65 && nursingMembers > 0) {
          const personalNursingIncome = Math.floor(nursingIncome * incomeRatio);
          const personalNursingCapita = Math.floor(nursingCapita / nursingMembers);
          personalNursing = personalNursingIncome + personalNursingCapita;
        }
        
        return {
          medical: Math.floor(personalMedical * calcDetails.reduction),
          support: Math.floor(personalSupport * calcDetails.reduction),
          nursing: Math.floor(personalNursing * calcDetails.reduction),
          total: Math.floor((personalMedical + personalSupport + personalNursing) * calcDetails.reduction),
          incomeBase: incomeRatio * householdIncomeBase
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
      
      // 個人別保険料の合計を計算して調整
      let individualTotal = individualInsurance.self.total;
      if (individualInsurance.spouse) {
        individualTotal += individualInsurance.spouse.total;
      }
      individualInsurance.children.forEach(child => {
        individualTotal += child.total;
      });
      
      // 世帯合計との差額を計算
      const difference = healthInsuranceYearly - individualTotal;
      
      // 差額がある場合は本人に調整（世帯主が差額を負担）
      if (difference !== 0) {
        individualInsurance.self.total += difference;
        // 医療分に差額を加算（最も金額が大きい項目）
        individualInsurance.self.medical += difference;
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
      
      // スクロールフラグを設定
      setShouldScroll(true);
      
    } catch (error) {
      console.error('計算エラー:', error);
      alert('計算中にエラーが発生しました: ' + error.message);
    }
  };

  return (
    <div className="container-fluid py-8 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card shadow-xl p-8 animate-slide-in-up"
      >
        {/* ヘッダー */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center mb-6"
        >
          <Calculator className="w-8 h-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">個人事業主向け社会保険料計算ツール【2025年度版】</h1>
            <p className="text-sm text-neutral-600 mt-1">東京都葛飾区の料率基準 | 事業主共生連サービスとの料金比較で最適な選択を</p>
          </div>
        </motion.div>
        
        {/* サービス紹介バナー */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 bg-gradient-primary text-white p-8 rounded-2xl shadow-primary"
        >
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
        </motion.div>
        
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
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={calculateInsurance}
          className="btn btn-primary w-full text-lg"
        >
          <Calculator className="w-5 h-5 mr-2" />
          保険料を計算する
        </motion.button>

        {/* 75歳以上の警告 */}
        {results && results.details.userAge >= 75 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 card bg-danger bg-opacity-10 border-2 border-danger"
          >
            <p className="text-danger font-semibold">
              <AlertCircle className="inline w-5 h-5 mr-2" />
              75歳以上の方は後期高齢者医療制度の対象となるため、国民健康保険の計算対象外です。
              後期高齢者医療制度の保険料については、お住まいの市区町村にお問い合わせください。
            </p>
          </motion.div>
        )}
        
        {/* 計算結果 */}
        {results && (
          <motion.div 
            id="results-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 scroll-mt-32 relative"
          >
            {/* 印刷ボタン */}
            <div className="mb-6 flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.print()}
                className="btn btn-success"
              >
                <Printer className="w-4 h-4 mr-2" />
                結果をPDFで保存
              </motion.button>
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
              bgColor="bg-gradient-accent"
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
              bgColor="bg-gradient-primary"
            />
            
            {/* 注意事項 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 flex items-start card bg-warning bg-opacity-10"
            >
              <AlertCircle className="w-5 h-5 text-warning mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-neutral-700">
                <p className="font-semibold mb-1">重要な注意事項：</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>この計算結果は2025年度の東京都の料率に基づく概算です</li>
                  <li>実際の保険料は前年の所得や各種控除によって変動します</li>
                  <li>事業主共生連サービスは介護保険料（40-64歳）も月額料金に含まれています</li>
                  <li>正確な金額は、お住まいの区市町村にお問い合わせください</li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default SocialInsuranceCalculator;