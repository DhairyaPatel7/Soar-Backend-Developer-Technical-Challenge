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
        const validatorsLoader = new ValidatorsLoader({
            models: require('../managers/_common/schema.models'),
            customValidators: require('../managers/_common/schema.validators'),
        });
        const resourceMeshLoader = new ResourceMeshLoader({});
        // const mongoLoader = new MongoLoader({ schemaExtension: "mongoModel.js" });

        this.validators = validatorsLoader.load();
        this.resourceNodes = resourceMeshLoader.load();
        // this.mongomodels = mongoLoader.load();
    }

    load() {
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

        // Ensure mongomodels and validators are correctly initialized
        const mongomodels = {
            school: require('../managers/entities/school/school.model'),
            user: require('../managers/entities/user/user.model'), // Add user model
            classroom: require('../managers/entities/classroom/classroom.model'),
            student: require('../managers/entities/student/student.model'), // Add student model
        };
        const validators = {
            school: require('../managers/entities/school/school.validator'),
            user: require('../managers/entities/user/user.validator'), // Add user validator
            classroom: require('../managers/entities/classroom/classroom.validator'), // Add user validator
            student: require('../managers/entities/student/student.validator'), // Add student validator
        };

        this.managers.school = new SchoolManager({ mongomodels, validators }); // Pass mongomodels and validators to SchoolManager
        this.managers.user = new UserManager({ mongomodels, validators, managers: this.managers }); // Add UserManager
        this.managers.classroom = new ClassroomManager({ mongomodels, validators }); // Pass mongomodels and validators to ClassroomManager
        this.managers.student = new StudentManager({ mongomodels, validators }); // Pass mongomodels and validators to StudentManager
        /*************************************************************************************************/
        this.managers.mwsExec = new VirtualStack({ ...{ preStack: [/* '__token', */'__device',] }, ...this.injectable });
        this.managers.userApi = new ApiHandler({ ...this.injectable, ...{ prop: 'httpExposed' } });
        this.managers.userServer = new UserServer({ config: this.config, managers: this.managers });

        return this.managers;
    }
}

