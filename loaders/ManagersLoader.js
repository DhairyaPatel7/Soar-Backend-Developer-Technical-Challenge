const MiddlewaresLoader     = require('./MiddlewaresLoader');
const ApiHandler            = require("../managers/api/Api.manager");
const LiveDB                = require('../managers/live_db/LiveDb.manager');
const UserServer            = require('../managers/http/UserServer.manager');
const ResponseDispatcher    = require('../managers/response_dispatcher/ResponseDispatcher.manager');
const VirtualStack          = require('../managers/virtual_stack/VirtualStack.manager');
const ValidatorsLoader      = require('./ValidatorsLoader');
const ResourceMeshLoader    = require('./ResourceMeshLoader');
const utils                 = require('../libs/utils');

const systemArch            = require('../static_arch/main.system');
const TokenManager          = require('../managers/token/Token.manager');
const SharkFin              = require('../managers/shark_fin/SharkFin.manager');
const TimeMachine           = require('../managers/time_machine/TimeMachine.manager');
const SchoolManager         = require('../managers/entities/school/School.manager');
const UserManager           = require('../managers/entities/user/User.manager');
const ClassroomManager      = require('../managers/entities/classroom/Classroom.manager');
const StudentManager        = require('../managers/entities/student/Student.manager');
const MongoLoader           = require('./MongoLoader');


/** 
 * load sharable modules
 * @return modules tree with instance of each module
*/
module.exports = class ManagersLoader {
    constructor({ config, cortex, cache, oyster, aeon }) {
        this.config = config;
        this.cache = cache;
        this.cortex = cortex;
        this.managers = {};
        this.injectable = { config, cache, cortex, managers: this.managers };
    }

    _preload() {
        const resourceMeshLoader = new ResourceMeshLoader({});
        this.resourceNodes = resourceMeshLoader.load();
    }

    load() {
        const mongoLoader = new MongoLoader({ schemaExtension: "model.js" });
        this.mongomodels = mongoLoader.load();
        const validatorsLoader = new ValidatorsLoader({ validatorExtension: 'validator.js' });
        this.validators = validatorsLoader.load();
        this.managers.responseDispatcher = new ResponseDispatcher();
        this.managers.liveDb = new LiveDB(this.injectable);
        const middlewaresLoader = new MiddlewaresLoader(this.injectable);
        const mwsRepo = middlewaresLoader.load();
        const { layers, actions } = systemArch;
        this.injectable.mwsRepo = mwsRepo;
        /*****************************************CUSTOM MANAGERS*****************************************/
        this.managers.shark = new SharkFin({ ...this.injectable, layers, actions });
        this.managers.timeMachine = new TimeMachine(this.injectable);
        this.managers.token = new TokenManager(this.injectable);

        this.managers.school = new SchoolManager({ mongomodels: this.mongomodels, validators: this.validators }); 
        this.managers.user = new UserManager({ mongomodels: this.mongomodels, validators: this.validators, managers: this.managers }); 
        this.managers.classroom = new ClassroomManager({ mongomodels: this.mongomodels, validators: this.validators }); 
        this.managers.student = new StudentManager({ mongomodels: this.mongomodels, validators: this.validators }); 
        /*************************************************************************************************/
        this.managers.mwsExec = new VirtualStack({ ...{ preStack: [/* '__token', */'__device',] }, ...this.injectable });
        this.managers.userApi = new ApiHandler({ ...this.injectable, ...{ prop: 'httpExposed' } });
        this.managers.userServer = new UserServer({ config: this.config, managers: this.managers });

        return this.managers;
    }
}

