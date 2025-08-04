import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AnalysisResults from '../components/AnalysisResults';

const AnalysisPage = () => {
    const { id } = useParams();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/analyses/${id}`);
                setAnalysis(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load analysis');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [id]);

    if (loading) return <div className="text-center mt-5">Loading analysis...</div>;
    if (error) return <div className="alert alert-danger mt-5">{error}</div>;
    if (!analysis) return <div className="alert alert-warning mt-5">Analysis not found</div>;

    return (
        <div>
            <h2 className="mb-4">Analysis: {analysis.filename}</h2>
            <p className="text-muted">
                Uploaded on: {new Date(analysis.upload_date).toLocaleString()}
            </p>

            <AnalysisResults analysis={analysis} />
        </div>
    );
};

export default AnalysisPage;