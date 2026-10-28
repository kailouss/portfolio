(function(scope){
const groups=[
{id:'co-developed',title:'Co-developed',role:'Co-developed',projects:[
{title:'Iloilo Business Club',mark:'IBC',repo:'Bugs-Over-Flowers/ibc-website',description:'A membership and events platform with applications, RSVPs, QR check-ins, and an admin workspace.',stack:['Next.js','React','TypeScript','Supabase','Tailwind CSS','Bun'],verified:true},
{title:'PSSE Website',mark:'PSSE',repo:'psse-dojo/psse-website',description:'Co-developed website project for PSSE. Further project details will be added when the repository is accessible.',stack:[],verified:false},
{title:'Vulnerability Scanner',mark:'SCAN',repo:'somosadas/Website-Vulnerability-Scanner',description:'A web application that classifies potentially malicious payloads using a custom convolutional neural network.',stack:['React','Flask','TensorFlow','Python','Keras','Vite'],verified:true},
{title:'Vicmar Inventory',mark:'VICMAR',repo:'DainzT/vicmar-inventory-management-system',description:'An inventory management system for tracking stocks and supporting fleet operations.',stack:['React','TypeScript','Express','Prisma','PostgreSQL','Tailwind CSS'],verified:true},
{title:'Sync Up',mark:'SYNC UP',repo:'MJayConstantino/Sync_Up',description:'A mobile workspace bringing together schedules, projects, tasks, and chat.',stack:['React Native','Expo','Firebase','JavaScript'],verified:true}
]},
{id:'personal',title:'Personal projects',role:'Personal project',projects:[
{title:'Indecisive Food Finder',mark:'FOOD',repo:'kailouss/IndecisiveFoodFinder',description:'Indecisive Food Finder is a personal project. Further details will be added when the repository is accessible.',stack:[],verified:false},
{title:'Puzzle Camera Hand Gesture',mark:'GESTURE',repo:'kailouss/Puzzle-Camera-Hand-Gesture',description:'Puzzle Camera Hand Gesture is a personal project. Further details will be added when the repository is accessible.',stack:[],verified:false},
{title:'Floyd’s Cycle Algorithm Game',mark:'FLOYD',repo:'kailouss/FloydsCycleAlgoGame',description:'A Godot game centred on Floyd’s cycle-finding algorithm, with hare and tortoise characters.',stack:['Godot','GDScript'],verified:true},
{title:'Terraform + Docker Demo',mark:'TF / DK',repo:'kailouss/terraform-docker-premade-demo',description:'An infrastructure-as-code demo that provisions an Nginx Docker container and serves a static HTML site.',stack:['Terraform','Docker','Nginx','HTML'],verified:true}
]}];
for(const group of groups)for(const project of group.projects){project.role=group.role;project.url='https://github.com/'+project.repo;project.notes=project.verified?'Description and technologies checked against the repository README and source files.':'Repository details are not publicly accessible at the supplied URL. The link and project category are provided by the portfolio owner.'}
scope.PortfolioProjectGroups=groups;
})(typeof window!=='undefined'?window:globalThis);

