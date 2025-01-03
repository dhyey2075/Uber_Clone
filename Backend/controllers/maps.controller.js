const mapsService = require('../services/maps.service');

module.exports.getCoordinates = async (req, res) => {
    const address = req.query.address;
    const response = await mapsService.getAddressCoordinated(address);
    const data = await response.json()
    const location = data.geocodingResults[0]
    return res.status(200).json({ name: location.name, address: location.formatted_address, coordinates: location.geometry.location });
}

module.exports.getAutoComplete = async (req, res) => {
    const {input, location} = req.query;
    const response = await mapsService.getAutoCompleteHelper(input, location);
    const data = await response.json()
    const ret = [];
    for (let i = 0; i < data.predictions.length; i++) {
        const obj = {
            name: data.predictions[i].structured_formatting.main_text,
            address: data.predictions[i].structured_formatting.secondary_text,
            coordinates: data.predictions[i].geometry.location,
            type: data.predictions[i].types[0]
        }
        ret.push(obj);
    }
    return res.status(200).json({ predictions: ret });
}

module.exports.getDistance = async (req, res) => {
    const { slong, slat, elong, elat } = req.query
    try{
        const response = await mapsService.getDistanceHelper(slat, slong, elat, elong);
        const data = await response.json()
        const distance = data.routes[0].legs[0]
        return res.status(200).json(distance);
    }
    catch(err){
        return res.status(400).json({message: err.message})
    }
}