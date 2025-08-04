import axios from 'axios';
import { useEffect, useState } from 'react';
import AnalysisResults from '../components/AnalysisResults';
import FileUpload from '../components/FileUpload';
import RecentAnalyses from '../components/RecentAnalyses';

const HomePage = () => {
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const [recentAnalyses, setRecentAnalyses] = useState([]);
    const [loadingRecent, setLoadingRecent] = useState(true);

    useEffect(() => {
        const fetchRecentAnalyses = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/analyses');
                setRecentAnalyses(response.data);
            } catch (error) {
                console.error('Error fetching recent analyses:', error);
            } finally {
                setLoadingRecent(false);
            }
        };

        fetchRecentAnalyses();
    }, []);

    const handleAnalysisComplete = (data) => {
        setCurrentAnalysis(data);
        // Add to recent analyses
        setRecentAnalyses(prev => [data, ...prev.slice(0, 4)]);
    };

    return (
        <div>
            <h2 className="mb-4">Market Basket Analysis</h2>

            <FileUpload onAnalysisComplete={handleAnalysisComplete} />

            {currentAnalysis && (
                <div className="mt-4">
                    <h3>Current Analysis Results</h3>
                    <AnalysisResults analysis={currentAnalysis} />
                </div>
            )}

            <div className="mt-5">
                <h3>Recent Analyses</h3>
                {loadingRecent ? (
                    <p>Loading recent analyses...</p>
                ) : (
                    <RecentAnalyses analyses={recentAnalyses} />
                )}
            </div>
        </div>
    );
};

export default HomePage;