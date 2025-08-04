import AnalysisResults from '@/components/AnalysisResults';
import FileUpload from '@/components/FileUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import Visualizations from '@/components/Visualizations';
import { ArrowLeft, BarChart3, Layers3, Lightbulb, Map, PackagePlus, TrendingUp, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Rule {
  antecedents: string[];
  consequents: string[];
  support: number;
  confidence: number;
  lift: number;
}

interface AnalysisData {
  frequent_itemsets: Array<{
    itemset: string[];
    support: number;
  }>;
  association_rules: Rule[];
  item_frequency: Record<string, number>;
  total_transactions: number;
}
function titleCase(s: string) {
  return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1));
}

function pct(x: number, digits = 2) {
  return (x * 100).toFixed(digits) + '%';
}

function topNByValue<T extends Record<string, number>>(obj: T, n: number) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

const Recommendations = ({ data, onBack }: { data: AnalysisData, onBack: () => void }) => {

  const { topItem, top5, totalUnits } = useMemo(() => {
    const entries = Object.entries(data.item_frequency);
    const totalUnits = entries.reduce((s, [, c]) => s + Number(c), 0);
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return {
      topItem: sorted[0] ? { name: sorted[0][0], units: sorted[0][1] } : null,
      top5: sorted.slice(0, 5),
      totalUnits,
    };
  }, [data]);
  const topRulesByLift = useMemo(() => {
    const MIN_SUPPORT = 0.005;
    const MIN_CONFIDENCE = 0.1;
    return data.association_rules
      .filter(r => r.support >= MIN_SUPPORT && r.confidence >= MIN_CONFIDENCE)
      .slice()
      .sort((a, b) => b.lift - a.lift)
      .slice(0, 10);
  }, [data]);

  const coLocationSentences = useMemo(() => {
    return topRulesByLift.map((r, i) => {
      const A = r.antecedents.join(', ');
      const C = r.consequents.join(', ');
      return (
        <li key={i} className="mb-2 font-light">
          When shoppers buy <strong className="font-medium">{A}</strong>, they are <strong className="font-medium">{r.lift.toFixed(2)}×</strong> more likely to also buy <strong className="font-medium">{C}</strong>{' '}
          (support {pct(r.support, 2)}, confidence {pct(r.confidence, 1)}). Place <strong className="font-medium">{C}</strong> near <strong className="font-medium">{A}</strong> to boost attach rate.
        </li>
      );
    });
  }, [topRulesByLift]);
  const bundleSuggestions = useMemo(() => {
    const seen = new Set<string>();
    const lines: string[] = [];
    topRulesByLift.forEach(r => {
      const key = [...r.antecedents, ...r.consequents].sort().join('|');
      if (seen.has(key)) return;
      seen.add(key);
      const items = [...r.antecedents, ...r.consequents];
      if (items.length >= 2) {
        lines.push(
          `Create a themed display/bundle for: ${items.map(titleCase).join(' + ')} (lift up to ${r.lift.toFixed(2)}).`
        );
      }
    });
    return lines.slice(0, 6);
  }, [topRulesByLift]);

  const layoutHeuristics = useMemo(() => {
    const tips: string[] = [];
    if (topItem) {
      tips.push(`"${titleCase(topItem.name)}" is your highest-selling product (${topItem.units.toLocaleString()} units, ~${pct(topItem.units / Math.max(totalUnits, 1), 1)} of units). Keep it at eye level and fully faced; use it as an anchor for cross-merch.`);
    }

    const anchorNames = top5.map(([name]) => name);
    if (anchorNames.length) {
      tips.push(
        `Use anchors: ${anchorNames.map(titleCase).join(', ')}. Surround each anchor with 2–3 high-lift complements (from rules) to drive add-to-basket.`
      );
    }
    tips.push(
      'Endcaps: feature top bundles and seasonal themes (e.g., "Taco Night", "Pasta Night") to raise visibility and impulse pickup.'
    );
    tips.push(
      'Checkout zone: place low-price, high-velocity add-ons (snacks, candy, small dairy, bottled drinks) for impulse conversion.'
    );
    tips.push(
      'Pathing: position essentials deeper in-store so shoppers traverse complementary aisles; place related categories adjacently.'
    );
    tips.push(
      'Margin mix: next to best sellers, place 1–2 higher-margin complements (e.g., premium variants, toppings, sauces).'
    );
    tips.push(
      'Private label strategy: co-locate private label right next to national brand best sellers to capture trade-down without losing the sale.'
    );
    tips.push(
      'Signage: translate association rules into micro-signs ("Most customers who buy Yogurt also add Curd"). Keep copy short and specific.'
    );
    return tips;
  }, [top5, topItem, totalUnits]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center text-sm font-medium text-[#4169E1] hover:text-[#3a5bc7] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to upload
        </button>

        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-slate-800 mb-3">Actionable Recommendations</h1>
          <p className="text-lg text-slate-600">Store optimization strategies based on your market basket analysis</p>
        </div>

        <div className="space-y-8">
          {/* Key Findings Card */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-[#4169E1]" />
                </div>
                <CardTitle className="text-2xl font-semibold text-slate-800">Key Findings</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-13">
                Top sellers and quick wins from your transaction data analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              {topItem ? (
                <div className="rounded-xl border border-slate-200 p-6 bg-gradient-to-r from-slate-50 to-white">
                  <div className="text-sm text-slate-500 font-medium mb-2">Highest-selling product</div>
                  <div className="text-2xl font-semibold text-slate-800 mb-3">{titleCase(topItem.name)}</div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-sm">
                      <span className="text-slate-600">Units:</span>{' '}
                      <span className="font-semibold text-[#4169E1]">{topItem.units.toLocaleString()}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-600">Share of units:</span>{' '}
                      <span className="font-semibold text-[#4169E1]">{pct(topItem.units / Math.max(totalUnits, 1), 2)}</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <span className="font-medium text-slate-700">Recommendation:</span> Keep{' '}
                    <span className="font-semibold text-[#4169E1]">{titleCase(topItem.name)}</span> at eye level and in high-traffic zones.
                    Use it as an anchor to promote complementary items from the rules below.
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500 p-4 bg-slate-50 rounded-lg">No item frequency found.</div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-slate-200 p-6 bg-white">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center mr-3">
                      <PackagePlus className="h-4 w-4 text-[#4169E1]" />
                    </div>
                    <span className="font-semibold text-slate-800 text-lg">Top 5 Selling Products</span>
                  </div>
                  <ol className="list-decimal ml-5 text-sm space-y-2">
                    {top5.map(([name, units], index) => (
                      <li key={name} className="flex items-center justify-between py-1">
                        <span className="font-medium text-slate-700">{titleCase(name)}</span>
                        <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded text-xs">
                          {units.toLocaleString()} units
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-xl border border-slate-200 p-6 bg-white">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center mr-3">
                      <Layers3 className="h-4 w-4 text-[#4169E1]" />
                    </div>
                    <span className="font-semibold text-slate-800 text-lg">Quick Wins</span>
                  </div>
                  <ul className="list-disc ml-5 text-sm space-y-2">
                    <li>Face up top sellers and ensure 0 stockouts during peak hours.</li>
                    <li>Co-locate high-lift consequents next to anchors (see below).</li>
                    <li>Promote bundles as "Buy Together & Save" or recipe kits.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Co-Location Card */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <Map className="h-5 w-5 text-[#4169E1]" />
                </div>
                <CardTitle className="text-2xl font-semibold text-slate-800">Co-Location & Cross-Sell</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-13">
                Turn high-lift association rules into strategic shelf adjacency
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {coLocationSentences.length ? (
                <ul className="list-disc ml-5 text-sm space-y-2 text-slate-600">
                  {coLocationSentences}
                </ul>
              ) : (
                <div className="text-sm text-slate-500 p-4 bg-slate-50 rounded-lg">
                  No strong rules found to suggest co-location.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bundle & Themed Displays Card */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-[#4169E1]" />
                </div>
                <CardTitle className="text-2xl font-semibold text-slate-800">Bundle & Themed Displays</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-13">
                Convert purchase patterns into shoppable themed experiences
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {bundleSuggestions.length ? (
                <ul className="list-disc ml-5 text-sm space-y-2 text-slate-600">
                  {bundleSuggestions.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-500 p-4 bg-slate-50 rounded-lg">
                  No bundle suggestions available.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Store-Wide Placement Strategies Card */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-[#4169E1]" />
                </div>
                <CardTitle className="text-2xl font-semibold text-slate-800">Store-Wide Placement Strategies</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-13">
                Best practices and placement recommendations informed by your data
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="list-disc ml-5 text-sm space-y-3 text-slate-600">
                {layoutHeuristics.map((t, i) => (
                  <li key={i} className="leading-relaxed">{t}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Top Association Rules Table */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-[#4169E1]" />
                </div>
                <CardTitle className="text-2xl font-semibold text-slate-800">Top Association Rules</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-13">
                Reference data for strategic decisions (Top 10 by Lift)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {topRulesByLift.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b-2 border-slate-200">
                        <th className="py-4 pr-4 font-semibold text-slate-700">Rule</th>
                        <th className="py-4 pr-4 font-semibold text-slate-700">Support</th>
                        <th className="py-4 pr-4 font-semibold text-slate-700">Confidence</th>
                        <th className="py-4 font-semibold text-slate-700">Lift</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topRulesByLift.map((r, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-4 pr-4 text-slate-800 font-medium">
                            <span className="text-[#4169E1]">{r.antecedents.join(', ')}</span>
                            <span className="text-slate-400 mx-2">→</span>
                            <span className="text-green-600">{r.consequents.join(', ')}</span>
                          </td>
                          <td className="py-4 pr-4 text-slate-600">{pct(r.support, 2)}</td>
                          <td className="py-4 pr-4 text-slate-600">{pct(r.confidence, 2)}</td>
                          <td className="py-4 text-[#4169E1] font-semibold">{r.lift.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-slate-500 p-4 bg-slate-50 rounded-lg">
                  No rules to display.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data: AnalysisData = await response.json();
      setAnalysisData(data);

      toast({
        title: 'Analysis Complete',
        description: `Found ${data.association_rules.length} association rules from ${data.total_transactions} transactions.`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Please make sure your Flask backend is running on localhost:5000',
        variant: 'destructive',
      });

      const demoData: AnalysisData = {
        frequent_itemsets: [
          { itemset: ['whole milk'], support: 0.255 },
          { itemset: ['other vegetables'], support: 0.193 },
          { itemset: ['rolls/buns'], support: 0.183 },
          { itemset: ['yogurt'], support: 0.139 },
          { itemset: ['whole milk', 'other vegetables'], support: 0.074 },
        ],
        association_rules: [
          { antecedents: ['yogurt', 'whole milk'], consequents: ['curd'], support: 0.0101, confidence: 0.1797, lift: 3.37 },
          { antecedents: ['curd'], consequents: ['yogurt', 'whole milk'], support: 0.0101, confidence: 0.1889, lift: 3.37 },
          { antecedents: ['citrus fruit', 'other vegetables'], consequents: ['root vegetables'], support: 0.0104, confidence: 0.3592, lift: 3.30 },
          { antecedents: ['root vegetables'], consequents: ['citrus fruit', 'other vegetables'], support: 0.0104, confidence: 0.0951, lift: 3.30 },
          { antecedents: ['yogurt', 'other vegetables'], consequents: ['whipped/sour cream'], support: 0.0102, confidence: 0.2342, lift: 3.27 },
          { antecedents: ['butter'], consequents: ['whole milk'], support: 0.027, confidence: 0.497, lift: 1.946 },
          { antecedents: ['yogurt'], consequents: ['whole milk'], support: 0.056, confidence: 0.402, lift: 1.571 },
        ],
        item_frequency: {
          'whole milk': 2513,
          'other vegetables': 1903,
          'rolls/buns': 1809,
          'soda': 1715,
          'yogurt': 1372,
          'bottled water': 1087,
          'root vegetables': 1072,
          'tropical fruit': 1032,
          'shopping bags': 969,
          'sausage': 924,
          'curd': 400,
        },
        total_transactions: 9835,
      };
      setAnalysisData(demoData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToUpload = () => {
    setAnalysisData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-12 px-6">
        {/* Main Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#4169E1] bg-opacity-10 flex items-center justify-center mr-4">
              <BarChart3 className="h-8 w-8 text-[#4169E1]" />
            </div>
            <h1 className="text-4xl font-semibold text-slate-800">Market Basket Analysis</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Discover hidden patterns in customer purchase behavior using the FP-Growth algorithm.
            Upload your transaction data to get insights, visualizations, and store-ready recommendations.
          </p>
        </div>

        {!analysisData ? (
          <div className="max-w-4xl mx-auto space-y-8">
            <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />

            {/* How It Works Card */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-[#4169E1]" />
                  </div>
                  <CardTitle className="text-2xl font-semibold text-slate-800">How It Works</CardTitle>
                </div>
                <CardDescription className="text-base text-slate-600 ml-13">
                  Simple three-step process to unlock insights from your transaction data
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
                    <div className="w-12 h-12 rounded-xl bg-[#4169E1] bg-opacity-10 flex items-center justify-center mx-auto mb-4">
                      <Upload className="h-6 w-6 text-[#4169E1]" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-lg mb-2">1. Upload Data</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Upload your CSV transaction data with items and purchase records
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
                    <div className="w-12 h-12 rounded-xl bg-[#4169E1] bg-opacity-10 flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-6 w-6 text-[#4169E1]" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-lg mb-2">2. Analyze</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Advanced FP-Growth algorithm discovers purchase patterns
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
                    <div className="w-12 h-12 rounded-xl bg-[#4169E1] bg-opacity-10 flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-6 w-6 text-[#4169E1]" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-lg mb-2">3. Get Insights</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      View actionable recommendations and interactive visualizations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border-0 p-2">
            <Tabs defaultValue="results" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-xl">
                <TabsTrigger
                  value="results"
                  className="font-semibold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-[#4169E1] data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                >
                  Analysis Results
                </TabsTrigger>
                <TabsTrigger
                  value="visualizations"
                  className="font-semibold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-[#4169E1] data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                >
                  Visualizations
                </TabsTrigger>
                <TabsTrigger
                  value="recommendations"
                  className="font-semibold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-[#4169E1] data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                >
                  Recommendations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="mt-8">
                <div className="px-6">
                  <button
                    onClick={handleBackToUpload}
                    className="flex items-center text-sm font-medium text-[#4169E1] hover:text-[#3a5bc7] transition-colors mb-6"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to upload
                  </button>
                </div>
                <AnalysisResults data={analysisData} />
              </TabsContent>

              <TabsContent value="visualizations" className="mt-8">
                <div className="px-6">
                  <button
                    onClick={handleBackToUpload}
                    className="flex items-center text-sm font-medium text-[#4169E1] hover:text-[#3a5bc7] transition-colors mb-6"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to upload
                  </button>
                </div>
                <Visualizations data={analysisData} />
              </TabsContent>

              <TabsContent value="recommendations" className="mt-8">
                <Recommendations data={analysisData} onBack={handleBackToUpload} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;