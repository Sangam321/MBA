import { Link } from 'react-router-dom';

const RecentAnalyses = ({ analyses }) => {
    if (analyses.length === 0) {
        return <p>No recent analyses found.</p>;
    }

    return (
        <div className="row">
            {analyses.map((analysis) => (
                <div key={analysis._id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">{analysis.filename}</h5>
                            <p className="card-text">
                                <small className="text-muted">
                                    {new Date(analysis.upload_date).toLocaleString()}
                                </small>
                            </p>
                            <p className="card-text">
                                <strong>Transactions:</strong> {analysis.results.transactions_count}<br />
                                <strong>Rules Found:</strong> {analysis.results.association_rules.length}
                            </p>
                            <Link
                                to={`/analysis/${analysis._id}`}
                                className="btn btn-outline-primary btn-sm"
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecentAnalyses;