interface Settings{
    title:string;
    baseURL:string;
    mockURL:string;
    env:Env;
}
//环境变量类型
//mock时可以使用前端模拟api
export enum Env{
    Mock='mock',
    Dev = 'dev',
    Pro = 'pro'
 }
export const settings:Settings ={
    title:'实验实训智能管理系统',
    env:Env.Mock,
    baseURL:"http://121.40.35.81:8085",
    mockURL:'http://127.0.0.1:5223/api',
}