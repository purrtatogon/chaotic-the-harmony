// MUST import Outlet to render nested routes
import { Outlet } from 'react-router-dom'; 

const DashboardLayout = () => {
    return (
        <div style={{ display: 'flex' }}>
            {/* sidebar code goes here */}
            
            <main>
                {/* this renders nested content */}
                <Outlet /> 
            </main>
        </div>
    );
};
export default DashboardLayout;