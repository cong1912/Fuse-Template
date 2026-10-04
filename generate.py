import os

reports = ["revenue", "orders", "products", "customers", "finance", "inventory", "marketing"]
reports_dir = "D:/Work/Fuse-Template/src/app/main/reports"
os.makedirs(reports_dir, exist_ok=True)

for report in reports:
    capitalized = report.capitalize()
    content = f"""import React from 'react';
import DataTable from 'src/admin-kit/DataTable';

const {capitalized}ReportPage = () => {{
    return (
        <div className="p-24 w-full">
            <h1 className="text-2xl font-bold mb-4">{capitalized} Report</h1>
            <DataTable data={{[]}} columns={{[]}} loading={{False}} pagination={{False}} />
        </div>
    );
}};

export default {capitalized}ReportPage;
"""
    with open(f"{reports_dir}/{capitalized}ReportPage.tsx", "w", encoding="utf-8") as f:
        f.write(content)

imports = "\n".join([f"const {r.capitalize()}ReportPage = lazy(() => import('./{r.capitalize()}ReportPage'));" for r in reports])
routes = "\n".join([f"                {{ path: '{r}', element: <{r.capitalize()}ReportPage /> }}," for r in reports])

config_content = f"""import React, {{ lazy }} from 'react';
import {{ Navigate }} from 'react-router-dom';

{imports}

const ReportsConfig = {{
    settings: {{
        layout: {{
            config: {{}}
        }}
    }},
    routes: [
        {{
            path: 'reports',
            children: [
{routes}
                {{ path: '', element: <Navigate to="revenue" /> }}
            ]
        }}
    ]
}};

export default ReportsConfig;
"""
with open(f"{reports_dir}/ReportsConfig.tsx", "w", encoding="utf-8") as f:
    f.write(config_content)


settings_dir = "D:/Work/Fuse-Template/src/app/main/settings"
os.makedirs(settings_dir, exist_ok=True)

staff_content = """import React from 'react';
import DataTable from 'src/admin-kit/DataTable';

const StaffPage = () => {
    return (
        <div className="p-24 w-full">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Staff Members</h1>
                <button className="bg-blue-500 text-white px-4 py-2 rounded">Invite</button>
            </div>
            <DataTable data={[]} columns={[]} loading={false} />
        </div>
    );
};

export default StaffPage;
"""
with open(f"{settings_dir}/StaffPage.tsx", "w", encoding="utf-8") as f:
    f.write(staff_content)

settings_config_content = """import React, { lazy } from 'react';

const StaffPage = lazy(() => import('./StaffPage'));

const SettingsConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    routes: [
        {
            path: 'settings',
            children: [
                {
                    path: 'staff',
                    element: <StaffPage />
                }
            ]
        }
    ]
};

export default SettingsConfig;
"""
with open(f"{settings_dir}/SettingsConfig.tsx", "w", encoding="utf-8") as f:
    f.write(settings_config_content)


account_dir = "D:/Work/Fuse-Template/src/app/main/account"
os.makedirs(account_dir, exist_ok=True)

profile_content = """import React from 'react';

const ProfilePage = () => {
    return (
        <div className="p-24 w-full">
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            <form className="flex flex-col gap-4 max-w-md">
                <input type="text" placeholder="Name" className="border p-2 rounded" />
                <input type="email" placeholder="Email" className="border p-2 rounded" />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Update Profile</button>
            </form>
        </div>
    );
};

export default ProfilePage;
"""
with open(f"{account_dir}/ProfilePage.tsx", "w", encoding="utf-8") as f:
    f.write(profile_content)

account_config_content = """import React, { lazy } from 'react';

const ProfilePage = lazy(() => import('./ProfilePage'));

const AccountConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    routes: [
        {
            path: 'account',
            children: [
                {
                    path: 'profile',
                    element: <ProfilePage />
                }
            ]
        }
    ]
};

export default AccountConfig;
"""
with open(f"{account_dir}/AccountConfig.tsx", "w", encoding="utf-8") as f:
    f.write(account_config_content)

print("Done")
