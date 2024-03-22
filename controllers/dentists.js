const Dentist = require('../models/Dentist');

//@desc      Get all dentists
//@router    GET /api/v1/dentists
//@access    Public
exports.getDentists = async (req, res, next) => {
    
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort','page','limit'];

        // Loop over remove fields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);
        console.log(reqQuery);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Finding resource
        query = Dentist.find(JSON.parse(queryStr)).populate('appointments');

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createAt');
        }
    
        //Pagination
        const page=parseInt(req.query.page,10) || 1;
        const limit=parseInt(req.query.limit,10) || 25;
        const startIndex=(page-1)*limit;
        const endIndex=page*limit;


        //Executing query
        try {
            const total=await Dentist.countDocuments();
            query=query.skip(startIndex).limit(limit);
            const Dentists = await query;
            //pagination result
            const pagination ={};
            if(endIndex < total) {
                pagination.next={
                    page:page+1,
                    limit
                }
            }

            if(startIndex>0) {
                pagination.prev={
                    page:page-1,
                    limit
                }
            }

            res.status(200).json({ success: true, count: Dentists.length,pagination ,data: Dentists });

        } catch (err) {
            res.status(400).json({success:false});
        }
};


//@desc      Get single dentist
//@router    GET /api/v1/dentists/:id
//@access    Public
exports.getDentist= async(req,res,next)=>{
    try{
        const dentist = await Dentist.findById(req.params.id);

        if(!dentist) {
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true,data:dentist});
    } catch(err) {
        res.status(400).json({success:false});
    }
};


//@desc      Create all dentists
//@router    POST /api/v1/dentists
//@access    Private
exports.createDentist=async(req,res,next)=>{
    const dentist = await Dentist.create(req.body);
    res.status(201).json({
        success : true,
        data : dentist
    });
};

//@desc      Update single dentist
//@router    PUT /api/v1/dentists/:id
//@access    Private
exports.updateDentist=async(req,res,next)=>{
    try {
        const dentist = await Dentist.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!dentist) {
            return res.status(400).json({success:false});
        }

        res.status(200).json({success:true,data: dentist});
    } catch (err) {
        res.status(400).json({success:false});
    }

}


exports.getBestDentist = async(req,res,next)=>{
    try {
        const maxExperience = await Dentist.aggregate([
            {
                $group: {
                    _id: null,
                    maxExperience: { $max: '$years_of_experience' },
                },
            },
        ]);

        if (maxExperience.length === 0) {
            return res.status(404).json({ success: false, error: 'No dentist found' });
        }
        const bestDentists = await Dentist.find({ years_of_experience: maxExperience[0].maxExperience });
        res.status(200).json({ success: true, data: bestDentists });

    } catch (error) {
        res.status(400).json({success:false,error:error.stack});
    }
}

//@desc      Delete single dentist
//@router    DELETE /api/v1/dentists/:id
//@access    Private
exports.deleteDentist= async(req,res,next)=>{
    try {
        const dentist = await Dentist.findById(req.params.id);

        if(!dentist) {
            return res.status(400).json({success:false, message:`Bootcamp not found with id of ${req.params.id}`});
        }

        await dentist.deleteOne();
        res.status(200).json({success:true, data: {}});
    } catch (err) {
        res.status(400).json({success:false});
    }
};

