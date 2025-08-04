import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const AnalysisResults = ({ analysis }) => {
    if (!analysis) return null;

    const { results } = analysis;
    const { item_frequencies, association_rules, transactions_count, unique_items } = results;

    // Prepare data for top 10 items chart
    const topItems = item_frequencies.slice(0, 10);
    const itemsData = {
        labels: topItems.map(item => item.item),
        datasets: [
            {
                label: 'Frequency',
                data: topItems.map(item => item.frequency),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            }
        ]
    };

    // Prepare data for rules confidence distribution
    const confidenceLevels = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    const confidenceCounts = new Array(confidenceLevels.length - 1).fill(0);

    association_rules.forEach(rule => {
        for (let i = 0; i < confidenceLevels.length - 1; i++) {
            if (rule.confidence >= confidenceLevels[i] && rule.confidence < confidenceLevels[i + 1]) {
                confidenceCounts[i]++;
                break;
            }
        }
    });

    const confidenceData = {
        labels: confidenceLevels.slice(0, -1).map((_, i) =>
            `${(confidenceLevels[i] * 100).toFixed(0)}%-${(confidenceLevels[i + 1] * 100).toFixed(0)}%`
        ),
        datasets: [
            {
                label: 'Number of Rules',
                data: confidenceCounts,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            }
        ]
    };

    return (
        <div className="analysis-results">
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h5>Dataset Overview</h5>
                        </div>
                        <div className="card-body">
                            <ul className="list-group">
                                <li className="list-group-item">Transactions: {transactions_count}</li>
                                <li className="list-group-item">Unique Items: {unique_items}</li>
                                <li className="list-group-item">Association Rules Found: {association_rules.length}</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h5>Analysis Parameters</h5>
                        </div>
                        <div className="card-body">
                            <ul className="list-group">
                                <li className="list-group-item">Minimum Support: {analysis.parameters.min_support}</li>
                                <li className="list-group-item">Minimum Confidence: {analysis.parameters.min_confidence}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h5>Top 10 Frequent Items</h5>
                        </div>
                        <div className="card-body">
                            <Bar
                                data={itemsData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        },
                                        title: {
                                            display: true,
                                            text: 'Most Frequent Items',
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h5>Rules Confidence Distribution</h5>
                        </div>
                        <div className="card-body">
                            <Pie
                                data={confidenceData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        },
                                        title: {
                                            display: true,
                                            text: 'Confidence Levels of Rules',
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header">
                    <h5>Association Rules (Top 20 by Confidence)</h5>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Antecedent</th>
                                    <th>Consequent</th>
                                    <th>Confidence</th>
                                    <th>Support</th>
                                </tr>
                            </thead>
                            <tbody>
                                {association_rules
                                    .sort((a, b) => b.confidence - a.confidence)
                                    .slice(0, 20)
                                    .map((rule, index) => (
                                        <tr key={index}>
                                            <td>{rule.antecedent.join(', ')}</td>
                                            <td>{rule.consequent.join(', ')}</td>
                                            <td>{(rule.confidence * 100).toFixed(1)}%</td>
                                            <td>{(rule.support * 100).toFixed(1)}%</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisResults;