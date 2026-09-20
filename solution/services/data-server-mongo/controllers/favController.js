const favService = require("../services/favService");

/**
 * Controller to handle HTTP requests for Favorites.
 * Acts as an interface between the API routes and the business logic service.
 *
 * @module controllers/favController
 */

/**
 * Handles the HTTP GET request to retrieve favorite items.
 * Extracts query parameters from the request, calls the service, and sends the response.
 *
 * @async
 * @function getFavs
 * @param {import('express').Request} req - The Express request object.
 * @param {Object} req.query - The query string parameters (filters, pagination, sorting).
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with the data or an error status.
 *
 * @example
 * // Request: GET /api/favorites?username=Otaku123&sort=-id
 * // Response: 200 JSON Array
 */
exports.getFavs = async (req, res) => {
    try {
        const params = req.query;
        const data = await favService.fetchFavorites(params);

        if (!data || data.length === 0) {
            return res.status(200).json([]);
        }

        return res.json(data);
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};