import React, { useState } from 'react';
import { Calculator, Users, FileText, AlertCircle, Info, ChevronDown, ChevronUp, CheckCircle, XCircle, ExternalLink, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      className="inline-flex items-center justify-center w-full bg-white bg-opacity-95 text-gray-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white transition-all duration-300"
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
        <motion.div whileHover={{ scale: 1.01 }} className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            年間所得（経費差引後）
          </label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            placeholder="例: 5000000"
          />
          <p className="text-xs text-gray-500 mt-1">売上から経費を引いた金額（円）</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.01 }} className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            年齢
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            placeholder="例: 45"
            min="20"
            max="100"
          />
        </motion.div>

        <motion.div whileHover={{ scale: 1.01 }} className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            確定申告の方法
          </label>
          <select
            value={doTaxReturn}
            onChange={(e) => setDoTaxReturn(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            <option value="yes">する</option>
            <option value="no">しない</option>
          </select>
        </motion.div>

        <AnimatePresence>
          {doTaxReturn === 'yes' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              whileHover={{ scale: 1.01 }} 
              className="bg-white p-4 rounded-lg shadow-sm"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                申告の種類
              </label>
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
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div whileHover={{ scale: 1.01 }} className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            配偶者
          </label>
          <select
            value={spouse}
            onChange={(e) => setSpouse(e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            <option value="false">なし</option>
            <option value="true">あり</option>
          </select>
        </motion.div>

        <AnimatePresence>
          {spouse && (
            <>
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                whileHover={{ scale: 1.01 }} 
                className="bg-white p-4 rounded-lg shadow-sm"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  配偶者の年齢
                </label>
                <input
                  type="number"
                  value={spouseAge}
                  onChange={(e) => setSpouseAge(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="例: 40"
                  min="20"
                  max="100"
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                whileHover={{ scale: 1.01 }} 
                className="bg-white p-4 rounded-lg shadow-sm"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  配偶者の年収（万円）
                </label>
                <input
                  type="number"
                  value={spouseIncome}
                  onChange={(e) => setSpouseIncome(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="例: 100"
                  min="0"
                />
                {spouseRangeInfo && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-xs mt-2 font-medium ${spouseRangeInfo.isInRange ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {spouseRangeInfo.message}
                  </motion.p>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <motion.div whileHover={{ scale: 1.01 }} className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            20歳以上の子供（扶養範囲内の人数）
          </label>
          <input
            type="number"
            value={childrenOver20InDependentRange}
            onChange={(e) => setChildrenOver20InDependentRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            placeholder="0"
            min="0"
            max="10"
          />
          <p className="text-xs text-gray-500 mt-1">年収130万円未満の成人子供の人数</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.01 }} className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            扶養可能な家族（両親・その他）
          </label>
          <input
            type="number"
            value={canProvideDependency}
            onChange={(e) => setCanProvideDependency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            placeholder="0"
            min="0"
            max="10"
          />
          <p className="text-xs text-gray-500 mt-1">現在国民健康保険を個別に支払っている扶養可能な家族の人数</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

// 計算ロジック
const calculateInsurance = (income, age, taxReturnType, spouse, spouseAge, childrenOver20InDependentRange) => {
  const taxDeduction = calculateTaxDeduction(taxReturnType);
  const incomeAfterDeduction = Math.max(0, income - taxDeduction);
  const kokuhoBase = Math.max(0, incomeAfterDeduction - CONSTANTS.BASIC_DEDUCTION_RESIDENT);
  
  // 世帯人数の計算
  const householdSize = 1 + (spouse ? 1 : 0) + parseInt(childrenOver20InDependentRange || 0);
  
  // 軽減判定
  let reductionRate = 0;
  if (kokuhoBase <= 430000 * householdSize) {
    reductionRate = 0.7;
  } else if (kokuhoBase <= 430000 + 295000 * householdSize) {
    reductionRate = 0.5;
  } else if (kokuhoBase <= 430000 + 545000 * householdSize) {
    reductionRate = 0.2;
  }
  
  // 医療分
  const medicalIncome = Math.min(kokuhoBase * CONSTANTS.TOKYO_RATES.medical.incomeRate, CONSTANTS.TOKYO_RATES.medical.maxAmount);
  const medicalCapita = CONSTANTS.TOKYO_RATES.medical.capita * householdSize * (1 - reductionRate);
  const medical = medicalIncome + medicalCapita;
  
  // 後期高齢者支援分
  const supportIncome = Math.min(kokuhoBase * CONSTANTS.TOKYO_RATES.support.incomeRate, CONSTANTS.TOKYO_RATES.support.maxAmount);
  const supportCapita = CONSTANTS.TOKYO_RATES.support.capita * householdSize * (1 - reductionRate);
  const support = supportIncome + supportCapita;
  
  // 介護分（40-64歳の人数）
  const kaigoEligibleCount = [age >= 40 && age < 65, spouse && parseInt(spouseAge) >= 40 && parseInt(spouseAge) < 65].filter(Boolean).length;
  const nursingIncome = kaigoEligibleCount > 0 
    ? Math.min(kokuhoBase * CONSTANTS.TOKYO_RATES.nursing.incomeRate, CONSTANTS.TOKYO_RATES.nursing.maxAmount) 
    : 0;
  const nursingCapita = CONSTANTS.TOKYO_RATES.nursing.capita * kaigoEligibleCount * (1 - reductionRate);
  const nursing = nursingIncome + nursingCapita;
  
  // 国保合計（上限適用）
  const kokuhoTotal = Math.min(medical + support + nursing, CONSTANTS.TOKYO_RATES.totalMaxAmount);
  
  // 国民年金
  const pensionCount = [age < 60, spouse && parseInt(spouseAge) < 60].filter(Boolean).length + 
    parseInt(childrenOver20InDependentRange || 0);
  const pension = CONSTANTS.PENSION_MONTHLY * 12 * pensionCount;
  
  // 65歳以上の介護保険料
  const over65Count = [age >= 65, spouse && parseInt(spouseAge) >= 65].filter(Boolean).length;
  const over65Kaigo = CONSTANTS.KAIGO_65_OVER_YEARLY * over65Count;
  
  return {
    kokuho: Math.round(kokuhoTotal),
    pension: Math.round(pension),
    over65Kaigo: Math.round(over65Kaigo),
    total: Math.round(kokuhoTotal + pension + over65Kaigo),
    details: {
      medical: Math.round(medical),
      support: Math.round(support),
      nursing: Math.round(nursing),
      reductionRate,
      kokuhoBase: Math.round(kokuhoBase),
      householdSize,
      kaigoEligibleCount,
      pensionCount,
      over65Count
    }
  };
};

// 結果表示コンポーネント
const ResultsDisplay = ({ results, onPrint }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const monthlyDifference = results.comparison.differenceMonthly;
  const isBetter = results.comparison.isJigyonushiBetter;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mt-8 space-y-6"
    >
      <div className="text-right mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrint}
          className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
        >
          <Printer className="w-4 h-4 mr-2" />
          印刷 / PDF保存
        </motion.button>
      </div>

      <motion.div 
        initial={{ x: -20 }}
        animate={{ x: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-blue-600" />
          現在の社会保険料（年額）
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>国民健康保険料</span>
            <span className="font-semibold">¥{formatNumber(results.current.kokuho)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span>国民年金保険料</span>
            <span className="font-semibold">¥{formatNumber(results.current.pension)}</span>
          </div>
          
          {results.current.over65Kaigo > 0 && (
            <div className="flex justify-between items-center">
              <span>介護保険料（65歳以上）</span>
              <span className="font-semibold">¥{formatNumber(results.current.over65Kaigo)}</span>
            </div>
          )}
          
          <div className="border-t pt-3">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>合計（年額）</span>
              <span className="text-blue-600">¥{formatNumber(results.current.total)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
              <span>月額換算</span>
              <span>¥{formatNumber(Math.round(results.current.total / 12))}</span>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setShowDetails(!showDetails)}
          className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center transition-colors duration-200"
        >
          {showDetails ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
          計算の詳細を{showDetails ? '隠す' : '見る'}
        </motion.button>

        <AnimatePresence>
          {showDetails && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-50 rounded-lg text-sm space-y-2"
            >
              <p>基準所得金額: ¥{formatNumber(results.current.details.kokuhoBase)}</p>
              <p>世帯人数: {results.current.details.householdSize}人</p>
              {results.current.details.reductionRate > 0 && (
                <p className="text-green-600">軽減率: {results.current.details.reductionRate * 100}%</p>
              )}
              <div className="pt-2 border-t">
                <p>医療分: ¥{formatNumber(results.current.details.medical)}</p>
                <p>後期高齢者支援分: ¥{formatNumber(results.current.details.support)}</p>
                {results.current.details.nursing > 0 && (
                  <p>介護分（40-64歳）: ¥{formatNumber(results.current.details.nursing)}</p>
                )}
              </div>
              <div className="pt-2 border-t">
                <p>国民年金加入者数: {results.current.details.pensionCount}人</p>
                {results.current.details.over65Count > 0 && (
                  <p>65歳以上介護保険対象者: {results.current.details.over65Count}人</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div 
        initial={{ x: 20 }}
        animate={{ x: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          事業主共生連の場合
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>月額保険料</span>
            <span className="font-semibold">¥{formatNumber(results.jigyonushi.monthly)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span>家族の追加保険料</span>
            <span className="font-semibold">
              {results.dependentFamilyCount > 0 
                ? `含まれています（${results.dependentFamilyCount}人分）` 
                : 'なし'}
            </span>
          </div>
          
          <div className="border-t pt-3 border-white border-opacity-30">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>合計（年額）</span>
              <span>¥{formatNumber(results.jigyonushi.yearly)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg">
          <p className="text-sm mb-1">含まれる保障内容:</p>
          <ul className="text-sm space-y-1">
            <li>• 健康保険（協会けんぽ）</li>
            <li>• 厚生年金保険</li>
            <li>• 労災保険相当の保障</li>
            <li>• 家族の扶養追加可能</li>
          </ul>
        </div>
      </motion.div>

      <motion.div 
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className={`rounded-lg shadow-lg p-6 ${isBetter ? 'bg-green-50' : 'bg-orange-50'}`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          {isBetter ? (
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 mr-2 text-orange-600" />
          )}
          比較結果
        </h3>
        
        <div className={`text-2xl font-bold mb-2 ${isBetter ? 'text-green-600' : 'text-orange-600'}`}>
          {isBetter ? (
            <>月額 ¥{formatNumber(Math.abs(monthlyDifference))} お得！</>
          ) : (
            <>月額 ¥{formatNumber(Math.abs(monthlyDifference))} 高くなります</>
          )}
        </div>
        
        <p className={`text-sm ${isBetter ? 'text-green-700' : 'text-orange-700'}`}>
          年間では ¥{formatNumber(Math.abs(results.comparison.differenceYearly))} の
          {isBetter ? '節約' : '増加'}になります
        </p>

        {results.dependentFamilyCount > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-3 bg-blue-100 rounded-lg"
          >
            <p className="text-sm text-blue-800">
              <Info className="w-4 h-4 inline mr-1" />
              さらに{results.dependentFamilyCount}人の扶養家族分の国民健康保険料（推定年額¥{formatNumber(results.dependentFamilySavings)}）も不要になります！
            </p>
          </motion.div>
        )}

        {!isBetter && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-3 bg-yellow-100 rounded-lg"
          >
            <p className="text-sm text-yellow-800">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              現在の収入レベルでは国民健康保険の方が安くなりますが、厚生年金による将来の年金額増加や、
              労災保険相当の保障などの付加価値も考慮することをお勧めします。
            </p>
          </motion.div>
        )}
      </motion.div>

      {isBetter && (
        <CTASection
          title="今すぐ保険料を節約しましょう！"
          subtitle="LINEで簡単に相談・お申し込みいただけます"
          benefits={[
            '✅ 最短即日で回答',
            '✅ 手続きは全てオンラインで完結',
            '✅ 追加費用なし・完全無料相談'
          ]}
          buttonText="LINE@で無料相談する"
          bgColor="bg-gradient-to-r from-green-500 to-green-600"
          isResults={true}
          results={results}
        />
      )}
    </motion.div>
  );
};

// メインコンポーネント
const SocialInsuranceCalculator = () => {
  const [income, setIncome] = useState('');
  const [age, setAge] = useState('');
  const [doTaxReturn, setDoTaxReturn] = useState('yes');
  const [taxReturnType, setTaxReturnType] = useState('blue-65');
  const [spouse, setSpouse] = useState(false);
  const [spouseAge, setSpouseAge] = useState('');
  const [spouseIncome, setSpouseIncome] = useState('');
  const [childrenOver20InDependentRange, setChildrenOver20InDependentRange] = useState('0');
  const [canProvideDependency, setCanProvideDependency] = useState('0');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    setError('');
    setIsCalculating(true);
    
    if (!income || !age || parseFloat(income) <= 0) {
      setError('年間所得と年齢を正しく入力してください。');
      setIsCalculating(false);
      return;
    }

    // アニメーション用の遅延
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const incomeNum = parseFloat(income);
      const ageNum = parseInt(age);
      const adjustedTaxReturnType = doTaxReturn === 'no' ? 'white' : taxReturnType;
      const spouseRangeInfo = getSpouseRangeInfo(spouse, spouseIncome, spouseAge);
      const spouseInRange = spouse && spouseRangeInfo?.isInRange;
      
      const current = calculateInsurance(
        incomeNum, 
        ageNum, 
        adjustedTaxReturnType, 
        spouseInRange,
        spouseAge,
        childrenOver20InDependentRange
      );
      
      const hasFamily = spouse || parseInt(childrenOver20InDependentRange) > 0;
      const jigyonushiMonthly = hasFamily ? CONSTANTS.JIGYONUSHI.FAMILY : CONSTANTS.JIGYONUSHI.SINGLE;
      const jigyonushiYearly = jigyonushiMonthly * 12;
      
      const differenceYearly = current.total - jigyonushiYearly;
      const differenceMonthly = Math.round(differenceYearly / 12);
      
      const dependentFamilyCount = parseInt(canProvideDependency) || 0;
      const avgKokuhoPerPerson = 100000;
      const dependentFamilySavings = dependentFamilyCount * avgKokuhoPerPerson;
      
      setResults({
        current,
        jigyonushi: {
          monthly: jigyonushiMonthly,
          yearly: jigyonushiYearly
        },
        comparison: {
          differenceYearly,
          differenceMonthly,
          isJigyonushiBetter: differenceYearly > 0
        },
        dependentFamilyCount,
        dependentFamilySavings
      });
    } catch (err) {
      setError('計算中にエラーが発生しました。入力内容を確認してください。');
    }
    
    setIsCalculating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <style jsx>{`
        @media print {
          body { 
            margin: 0; 
            background: white;
          }
          .no-print { 
            display: none !important; 
          }
          .print-break-inside-avoid { 
            break-inside: avoid; 
          }
        }
      `}</style>
      
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            社会保険料比較シミュレーター
          </h1>
          <p className="text-gray-600">
            個人事業主の社会保険料を簡単に比較・計算
          </p>
        </motion.div>

        <CTASection
          title="社会保険料を大幅に節約できるかも？"
          subtitle="事業主共生連なら、家族まとめて定額の社会保険に加入可能！"
          benefits={[
            '✅ 単身者は月額38,500円、家族持ちでも月額40,000円の定額制',
            '✅ 健康保険＋厚生年金＋労災相当の保障が全て含まれる',
            '✅ 扶養家族も追加費用なしで加入可能'
          ]}
          buttonText="詳細を確認する"
          bgColor="bg-gradient-to-r from-blue-600 to-blue-700 no-print"
        />

        <BasicInfoForm
          income={income}
          setIncome={setIncome}
          age={age}
          setAge={setAge}
          doTaxReturn={doTaxReturn}
          setDoTaxReturn={setDoTaxReturn}
          taxReturnType={taxReturnType}
          setTaxReturnType={setTaxReturnType}
          spouse={spouse}
          setSpouse={setSpouse}
          spouseAge={spouseAge}
          setSpouseAge={setSpouseAge}
          spouseIncome={spouseIncome}
          setSpouseIncome={setSpouseIncome}
          childrenOver20InDependentRange={childrenOver20InDependentRange}
          setChildrenOver20InDependentRange={setChildrenOver20InDependentRange}
          canProvideDependency={canProvideDependency}
          setCanProvideDependency={setCanProvideDependency}
        />

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center"
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCalculate}
          disabled={isCalculating}
          className={`mt-6 w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center ${
            isCalculating 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
          }`}
        >
          {isCalculating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"
              />
              計算中...
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5 mr-2" />
              保険料を計算する
            </>
          )}
        </motion.button>

        <AnimatePresence>
          {results && (
            <ResultsDisplay results={results} onPrint={handlePrint} />
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-blue-50 rounded-lg no-print"
        >
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-600" />
            ご注意事項
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• 本計算は2025年度の東京都葛飾区の保険料率を基準としています</li>
            <li>• 実際の保険料は市区町村により異なります</li>
            <li>• 介護保険料（65歳以上）は全国平均の概算値です</li>
            <li>• 詳細な計算結果は、お住まいの市区町村にご確認ください</li>
            <li>• 事業主共生連の加入には一定の条件があります</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default SocialInsuranceCalculator;